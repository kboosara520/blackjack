import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Game, RuleSet } from './game';
import { GameMode } from './types/game-mode';
import { card, Card, Rank } from './types/card';
import { processHands } from './hands-processor';
import {
	checkForReshuffle,
	discard,
	drawCard,
	initShoe,
	revealCard,
} from './shoe';
import { IOManager } from './io-manager/io-manager';

jest.mock('./hands-processor', () => ({
	processHands: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
}));

jest.mock('./shoe', () => ({
	checkForReshuffle: jest.fn(),
	discard: jest.fn(),
	drawCard: jest.fn(),
	initShoe: jest.fn(),
	revealCard: jest.fn(),
}));

const mockedCheckForReshuffle = jest.mocked(checkForReshuffle);
const mockedDiscard = jest.mocked(discard);
const mockedDrawCard = jest.mocked(drawCard);
const mockedInitShoe = jest.mocked(initShoe);
const mockedProcessHands = jest.mocked(processHands);
const mockedRevealCard = jest.mocked(revealCard);

function createIOManager(): IOManager {
	return {
		readLine: jest.fn<() => Promise<string | null>>().mockResolvedValue('100'),
		output: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
		cleanup: jest.fn(),
	};
}

function queueCards(cards: Card[]): void {
	mockedDrawCard.mockImplementation(() => {
		const nextCard = cards.shift();
		if (!nextCard) throw new Error('Test card queue is empty');
		return nextCard;
	});
}

describe('Game', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedProcessHands.mockResolvedValue(undefined);
	});

	it('initializes the shoe and creates the requested players', () => {
		new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 2, 4, createIOManager());

		expect(mockedInitShoe).toHaveBeenCalledWith(4, 75);
	});

	it('plays a normal round and cleans up the hands', async () => {
		queueCards([
			card(Rank.Ten),
			card(Rank.Two),
			card(Rank.Five),
			card(Rank.Six)
		]);
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 1, 1, createIOManager());

		await game.playRound();

		expect(mockedCheckForReshuffle).toHaveBeenCalledTimes(1);
		expect(mockedProcessHands).toHaveBeenCalledTimes(2);
		expect(mockedRevealCard).toHaveBeenCalledTimes(1);
		expect(mockedDiscard).toHaveBeenCalledTimes(4);
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
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 1, 1, createIOManager());

		await game.playRound();

		expect(mockedProcessHands).not.toHaveBeenCalled();
		expect(mockedRevealCard).not.toHaveBeenCalled();
		expect(mockedDiscard).toHaveBeenCalledTimes(4);
	});

	it('pushes a player blackjack when the dealer also has blackjack', async () => {
		queueCards([
			card(Rank.Ace),
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Ace)
		]);
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 1, 1, createIOManager());

		await game.playRound();

		const player = (game as any).players[0];
		expect(player.getChips()).toBe(1000);
		expect(mockedDiscard).toHaveBeenCalledTimes(4);
	});

	it('pays a player blackjack before hand processing', async () => {
		queueCards([
			card(Rank.Ace),
			card(Rank.Ten),
			card(Rank.Ten),
			card(Rank.Six)
		]);
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 1, 1, createIOManager());

		await game.playRound();

		const player = (game as any).players[0];
		expect(player.getChips()).toBe(1150);
		expect(mockedProcessHands).toHaveBeenCalledTimes(2);
		expect(mockedProcessHands).toHaveBeenCalledWith(
			(game as any).dealer,
			expect.anything(),
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
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 1, 1, createIOManager());

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
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 1, 1, createIOManager());

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
		const game = new Game(GameMode.Normal, RuleSet.S17NoSurrrender, 75, 2, 1, createIOManager());

		await game.playRound();

		const players = (game as any).players;
		expect(players[0].getChips()).toBe(1000);
		expect(players[1].getChips()).toBe(900);
	});

});
