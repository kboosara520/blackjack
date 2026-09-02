import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { processHands } from './hands-processor';
import { Player } from './participants/player';
import { IOManager } from './io-manager/io-manager';
import { card, Rank } from './types/card';
import { Move } from './types/hand';
import { Shoe } from './shoe';

jest.mock('./io-manager/stdin-input', () => ({
    StdIO: jest.fn().mockImplementation(() => ({
        output: jest.fn(),
    })),
}));

let testShoe: Shoe;
let mockedDrawCard: ReturnType<typeof jest.spyOn>;

function createPlayer(moves: string[], chips = 600): Player {
    const ioManager: IOManager = {
        readLine: jest.fn<() => Promise<string | null>>()
            .mockResolvedValueOnce(moves[0] ?? null)
            .mockResolvedValueOnce(moves[1] ?? null)
            .mockResolvedValueOnce(moves[2] ?? null),
        output: jest.fn<() => Promise<void>>(),
        cleanup: jest.fn(),
    };

    return new Player('test', chips, ioManager);
}

function createProcessorIO(): IOManager {
    return {
        readLine: jest.fn<() => Promise<string | null>>(),
        output: jest.fn<() => Promise<void>>(),
        cleanup: jest.fn(),
    };
}

async function placeInitialBet(player: Player, betSize = 100): Promise<void> {
    const placedBet = await player.makeBet(betSize);
    player.newHand(placedBet);
}

describe('processHands', () => {
    beforeEach(() => {
        testShoe = new Shoe(1, 50);
        mockedDrawCard = jest.spyOn(testShoe, 'drawCard');
    });

    it('rejects an invalid move', async () => {
        const player = createPlayer([]);
        await placeInitialBet(player);
        player.getHand(0).addCard(card(Rank.Two));
        player.makeMove = jest
            .fn<(handIdx: number) => Promise<Move>>()
            .mockResolvedValue('invalid' as Move);

        await expect(processHands(player, testShoe, createProcessorIO())).rejects.toThrow('Invalid move invalid.');
    });

    it('processes a hit and then a stand', async () => {
        const player = createPlayer([Move.Hit, Move.Stand]);
        await placeInitialBet(player);
        player.getHand(0).addCard(card(Rank.Two));
        player.getHand(0).addCard(card(Rank.Three));
        mockedDrawCard.mockReturnValueOnce(card(Rank.Five));

        await processHands(player, testShoe, createProcessorIO());

        const hand = player.getHand(0);
        expect(hand.length()).toBe(3);
        expect(hand.getTotal()).toBe(10);
        expect(hand.getIsActive()).toBe(false);
        expect(mockedDrawCard).toHaveBeenCalledTimes(1);
    });

    it('marks the hand done when a hit causes a bust', async () => {
        const player = createPlayer([Move.Hit]);
        await placeInitialBet(player);
        player.getHand(0).addCard(card(Rank.Ten));
        player.getHand(0).addCard(card(Rank.Ten));
        mockedDrawCard.mockReturnValueOnce(card(Rank.Five));

        await processHands(player, testShoe, createProcessorIO());

        const hand = player.getHand(0);
        expect(hand.getTotal()).toBe(25);
        expect(hand.getIsDone()).toBe(true);
        expect(hand.getIsActive()).toBe(false);
    });

    it('doubles the bet, draws one card, and finishes the hand', async () => {
        const player = createPlayer([Move.Double]);
        await placeInitialBet(player);
        player.getHand(0).addCard(card(Rank.Six));
        player.getHand(0).addCard(card(Rank.Four));
        mockedDrawCard.mockReturnValueOnce(card(Rank.Two));

        await processHands(player, testShoe, createProcessorIO());

        const hand = player.getHand(0);
        expect(hand.getBetSize()).toBe(200);
        expect(hand.length()).toBe(3);
        expect(hand.getIsActive()).toBe(false);
        expect(player.getChips()).toBe(400);
    });

    it('rejects double when the player cannot afford the additional bet', async () => {
        const player = createPlayer([], 100);
        await placeInitialBet(player, 100);
        player.getHand(0).addCard(card(Rank.Six));
        player.getHand(0).addCard(card(Rank.Four));
        player.makeMove = jest
            .fn<(handIdx: number) => Promise<Move>>()
            .mockResolvedValue(Move.Double);

        await expect(processHands(player, testShoe, createProcessorIO()))
            .rejects
            .toThrow('test does not have enough chips.');
    });

    it('marks the hand done when doubling causes a bust', async () => {
        const player = createPlayer([]);
        await placeInitialBet(player);
        player.getHand(0).addCard(card(Rank.Ten));
        player.getHand(0).addCard(card(Rank.Six));
        player.makeMove = jest
            .fn<(handIdx: number) => Promise<Move>>()
            .mockResolvedValue(Move.Double);
        mockedDrawCard.mockReturnValueOnce(card(Rank.Ten));

        await processHands(player, testShoe, createProcessorIO());

        expect(player.getHand(0).getTotal()).toBe(26);
        expect(player.getHand(0).getIsDone()).toBe(true);
    });

    it('finishes the original hand before processing a split hand', async () => {
        const player = createPlayer([Move.Split, Move.Stand, Move.Stand]);
        await placeInitialBet(player);
        player.getHand(0).addCard(card(Rank.Eight));
        player.getHand(0).addCard(card(Rank.Eight));
        mockedDrawCard
            .mockReturnValueOnce(card(Rank.Two))
            .mockReturnValueOnce(card(Rank.Three));

        await processHands(player, testShoe, createProcessorIO());

        expect(player.getHands()).toHaveLength(2);
        expect(player.getHand(0).getIsActive()).toBe(false);
        expect(player.getHand(1).getIsActive()).toBe(false);
        expect(player.getHand(0).getBetSize()).toBe(100);
        expect(player.getHand(1).getBetSize()).toBe(100);
        expect(player.getHand(0).getTotal()).toEqual(10);
        expect(player.getHand(1).getTotal()).toEqual(11);
        expect(player.getChips()).toBe(400);
        expect(mockedDrawCard).toHaveBeenCalledTimes(2);
    });

    it('rejects splitting a non-pair hand', async () => {
        const player = createPlayer([]);
        await placeInitialBet(player);
        player.getHand(0).addCard(card(Rank.Eight));
        player.getHand(0).addCard(card(Rank.Nine));
        player.makeMove = jest
            .fn<(handIdx: number) => Promise<Move>>()
            .mockResolvedValue(Move.Split);

        await expect(processHands(player, testShoe, createProcessorIO()))
            .rejects
            .toThrow("test's hand 0 is not a pair, therefore, it can't be split.");
    });

    it('rejects splitting when the player cannot afford the additional bet', async () => {
        const player = createPlayer([], 100);
        await placeInitialBet(player, 100);
        player.getHand(0).addCard(card(Rank.Eight));
        player.getHand(0).addCard(card(Rank.Eight));
        player.makeMove = jest
            .fn<(handIdx: number) => Promise<Move>>()
            .mockResolvedValue(Move.Split);

        await expect(processHands(player, testShoe, createProcessorIO()))
            .rejects
            .toThrow('test does not have enough chips.');
    });
});
