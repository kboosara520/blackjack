import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Game, RuleSet } from './game';
import { GameMode } from './types/game-mode';
import { card, Card, Rank } from './types/card';
import { Move } from './types/hand';
import { processHands } from './hands-processor';
import { Player } from './participants/player';
import { Shoe } from './shoe';
import { GameEventSink } from './communication/game-event-sink';
import { GameInput } from './communication/game-input';

jest.mock('./hands-processor', () => ({
	processHands: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

jest.mock('./shoe', () => ({
	Shoe: jest.fn(),
}));

const mockedShoeConstructor = jest.mocked(Shoe);
const mockedProcessHands = jest.mocked(processHands);
let mockedShoe: {
	checkForReshuffle: jest.Mock;
	discard: jest.Mock;
	drawCard: jest.Mock;
	updateRunningCount: jest.Mock;
};

type TestGameIO = GameInput & GameEventSink;

function createTestGameIO(): TestGameIO {
	return {
		waitForBet: jest.fn<() => Promise<number>>().mockResolvedValue(100),
		waitForMove: jest.fn<() => Promise<Move>>().mockResolvedValue(Move.Hit),
		publish: jest.fn(),
	};
}

function createPlayers(noOfPlayers: number, gameInput: GameInput): Player[] {
	return Array.from(
		{ length: noOfPlayers },
		(_, index) => new Player(index, `Player ${index}`, 1000, gameInput),
	);
}

function queueCards(cards: Card[]): void {
	mockedShoe.drawCard.mockImplementation((...args: unknown[]) => {
		const nextCard = cards.shift();
		if (!nextCard) throw new Error('Test card queue is empty');
		const isFaceUp = args[0] as boolean | undefined;
		nextCard.isFaceUp = isFaceUp ?? true;
		return nextCard;
	});
}

describe('Game', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedShoe = {
			checkForReshuffle: jest.fn(),
			discard: jest.fn(),
			drawCard: jest.fn(),
			updateRunningCount: jest.fn(),
		};
		mockedShoeConstructor.mockImplementation(() => mockedShoe as unknown as jest.Mocked<Shoe>);
		mockedProcessHands.mockResolvedValue(undefined);
	});

	it('initializes the shoe and creates the requested players', () => {
		const testGameIO = createTestGameIO();
		new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, createPlayers(2, testGameIO), 4, testGameIO, testGameIO);

		expect(mockedShoeConstructor).toHaveBeenCalledWith(4, 75);
	});

	it('plays a normal round and cleans up the hands', async () => {
		queueCards([
			card(Rank.Ten),
			card(Rank.Two),
			card(Rank.Five),
			card(Rank.Six)
		]);
		const testGameIO = createTestGameIO();
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, createPlayers(1, testGameIO), 1, testGameIO, testGameIO);

		await game.playRound();

		expect(mockedShoe.checkForReshuffle).toHaveBeenCalledTimes(1);
		expect(mockedProcessHands).toHaveBeenCalledTimes(2);
		expect(mockedShoe.discard).toHaveBeenCalledTimes(4);
		expect((game as any).players[0].getHands()).toHaveLength(0);
		expect((game as any).dealer.getHands()).toHaveLength(1);
		expect((game as any).dealer.getHand(0).length()).toBe(0);
	});

	it('ends the round immediately when the dealer has blackjack', async () => {
		queueCards([
			card(Rank.Ten),
			card(Rank.Ace),
			card(Rank.Nine),
			card(Rank.Ten)
		]);
		const testGameIO = createTestGameIO();
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, createPlayers(1, testGameIO), 1, testGameIO, testGameIO);

		await game.playRound();

		expect(mockedProcessHands).not.toHaveBeenCalled();
		expect(mockedShoe.discard).toHaveBeenCalledTimes(4);
	});

	it('pushes a player blackjack when the dealer also has blackjack', async () => {
		queueCards([
			card(Rank.Ace),
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Ace)
		]);
		const testGameIO = createTestGameIO();
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, createPlayers(1, testGameIO), 1, testGameIO, testGameIO);

		await game.playRound();

		const player = (game as any).players[0];
		expect(player.getChips()).toBe(1000);
		expect(mockedShoe.discard).toHaveBeenCalledTimes(4);
	});

	it('pays a player blackjack before hand processing', async () => {
		queueCards([
			card(Rank.Ace),
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Six)
		]);
		const testGameIO = createTestGameIO();
		const players = createPlayers(1, testGameIO);
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, players, 1, testGameIO, testGameIO);

		await game.playRound();

		const player = (game as any).players[0];
		expect(player.getChips()).toBe(1150);
		expect(mockedProcessHands).toHaveBeenCalledTimes(1);
		expect(mockedProcessHands).toHaveBeenCalledWith(
			players[0],
			expect.anything(),
			testGameIO
		);
	});

	it('pays active player hands when the dealer busts', async () => {
		queueCards([
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Nine),
			card(Rank.Six)
		]);
		mockedProcessHands.mockImplementation(async (participant) => {
			if (participant.name === 'Dealer') {
				participant.getHand(0).addCard(card(Rank.Ten));
			}
		});
		const testGameIO = createTestGameIO();
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, createPlayers(1, testGameIO), 1, testGameIO, testGameIO);

		await game.playRound();

		expect((game as any).players[0].getChips()).toBe(1100);
		expect(mockedProcessHands).toHaveBeenCalledTimes(2);
	});

	it('does not pay a completed hand when the dealer busts', async () => {
		queueCards([
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Nine),
			card(Rank.Six)
		]);
		mockedProcessHands.mockImplementation(async (participant) => {
			if (participant.name === 'Player 0') {
				participant.getHand(0).setDone();
			}
			if (participant.name === 'Dealer') {
				participant.getHand(0).addCard(card(Rank.Ten));
			}
		});
		const testGameIO = createTestGameIO();
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, createPlayers(1, testGameIO), 1, testGameIO, testGameIO);

		await game.playRound();

		expect((game as any).players[0].getChips()).toBe(900);
	});

	it('pushes equal hands and leaves lower hands unpaid', async () => {
		queueCards([
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Seven),
			card(Rank.Six),
			card(Rank.Seven)
		]);
		const testGameIO = createTestGameIO();
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, createPlayers(2, testGameIO), 1, testGameIO, testGameIO);

		await game.playRound();

		const players = (game as any).players;
		expect(players[0].getChips()).toBe(1000);
		expect(players[1].getChips()).toBe(900);
	});

});
