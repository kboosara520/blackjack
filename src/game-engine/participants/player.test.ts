import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Player } from './player';
import { Hand, Move } from '../types/hand';
import { card, Rank } from '../types/card';
import { GameInput } from '../communication/game-input';

describe('player', () => {
    let player: Player;
    const startingChips: number = 600;

    const mockInput: GameInput = {
        waitForMove: jest.fn<() => Promise<Move>>(),
        waitForBet: jest.fn<() => Promise<number>>(),
    };

    beforeEach(() => {
        jest.mocked(mockInput.waitForMove).mockResolvedValue(Move.Hit);
        jest.mocked(mockInput.waitForBet).mockResolvedValue(100);
        player = new Player(0, 'test', startingChips, mockInput);
    });

    it('can get all hands', () => {
        player.newHand(100);
        player.newHand(200);
        player.newHand(300);
        expect(player.getHands().length).toEqual(3);
    });

    it('can create a new hand', () => {
        expect(player.getHands().length).toEqual(0);
        player.newHand(100);
        expect(player.getHands().length).toEqual(1);
    });

    it('throws if hand does not exist', () => {
        player.newHand(100);
        expect(() => player.getHand(1)).toThrow('Index out of bounds');
    });

    it('can get a specific hand with the index', () => {
        player.newHand(100);
        player.newHand(200);
        player.newHand(300);
        const middleHand: Hand = player.getHand(1);
        expect(middleHand.getBetSize()).toEqual(200);
    });

    it('can update chips when a player wins', () => {
        player.winChips(400);
        expect(player.getChips()).toEqual(1000);
    });

    it('can empty a player\'s hand', () => {
        player.newHand(100);
        player.newHand(200);
        player.newHand(300);
        expect(player.getHands().length).toEqual(3);
        player.emptyHands();
        expect(player.getHands().length).toEqual(0);
    });

    describe('makeMove', () => {
        it('asks the player to make a move', async () => {
            player.newHand(100);
            expect(await player.makeMove(0)).toEqual('H');
        });
    
        it('throws if the move is null', async () => {
            player.newHand(100);
            jest.mocked(mockInput.waitForMove).mockRejectedValue(
                new Error("Input is null likely because the file has ended"),
            );
            await expect(player.makeMove(0))
                .rejects
                .toThrow("Input is null likely because the file has ended");
        });

        it('throws if move is not allowed', async () => {
            player.newHand(100);
            jest.mocked(mockInput.waitForMove).mockResolvedValue("HELLO" as Move);
            await expect(player.makeMove(0))
                .rejects
                .toThrow("Move HELLO is not allowed");
        });

        it('allows double when the hand has two cards and the player has enough chips', async () => {
            player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Six));
            player.getHand(0).addCard(card(Rank.Four));

            jest.mocked(mockInput.waitForMove).mockResolvedValue(Move.Double);

            await expect(player.makeMove(0)).resolves.toBe('D');
        });

        it('does not allow double when the player does not have enough chips', async () => {
            player = new Player(0, 'test', startingChips - 1, mockInput);
            player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Six));
            player.getHand(0).addCard(card(Rank.Four));

            jest.mocked(mockInput.waitForMove).mockResolvedValue(Move.Double);

            await expect(player.makeMove(0))
                .rejects
                .toThrow('Move D is not allowed');
        });

        it('allows split when the hand has two cards, enough chips, and is a pair', async () => {
            player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Eight));
            player.getHand(0).addCard(card(Rank.Eight));

            jest.mocked(mockInput.waitForMove).mockResolvedValue(Move.Split);

            await expect(player.makeMove(0)).resolves.toBe('P');
        });

        it('does not allow split when the hand is not a pair', async () => {
           player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Eight));
            player.getHand(0).addCard(card(Rank.Nine));

            jest.mocked(mockInput.waitForMove).mockResolvedValue(Move.Split);

            await expect(player.makeMove(0))
                .rejects
                .toThrow('Move P is not allowed');
        });
    });

    describe('makeBet', () => {
        it('asks the player to make a bet', async () => {
            jest.mocked(mockInput.waitForBet).mockResolvedValue(100);
            expect(await player.makeBet()).toEqual(100);
            expect(player.getChips()).toEqual(startingChips - 100);
        });

        it('throws if the bet is null', async () => {
            jest.mocked(mockInput.waitForBet).mockRejectedValue(
                new Error("Input is null likely because the file has ended"),
            );
            await expect(player.makeBet())
                .rejects
                .toThrow("Input is null likely because the file has ended");
        });

        it('throws if the bet is empty', async () => {
            jest.mocked(mockInput.waitForBet).mockRejectedValue(
                new Error("Input is null likely because the file has ended"),
            );

            await expect(player.makeBet())
                .rejects
                .toThrow("Input is null likely because the file has ended");
        });

        it('throws if the bet is not a number', async () => {
            jest.mocked(mockInput.waitForBet).mockRejectedValue(new Error("Not a number"));

            await expect(player.makeBet())
                .rejects
                .toThrow("Not a number");
        });

        it('throws if the bet exceeds available chips', async () => {
            jest.mocked(mockInput.waitForBet).mockResolvedValue(startingChips + 1);

            await expect(player.makeBet())
                .rejects
                .toThrow("test does not have enough chips");
        });

        it('accepts forced bet size', async () => {
            const forcedBetSize: number = 250;
            expect(await player.makeBet(forcedBetSize)).toEqual(forcedBetSize);
            expect(player.getChips()).toEqual(startingChips - forcedBetSize);
        });
    });

    it('checks if the player is active', () => {
        expect(player.isActive()).toBe(false);

        player.newHand(100);
        expect(player.isActive()).toBe(true);

        player.getHand(0).setInactive();
        expect(player.isActive()).toBe(false);

        player.newHand(100);
        player.newHand(100);
        player.getHand(0).setInactive();
        expect(player.isActive()).toBe(true);
    });
});