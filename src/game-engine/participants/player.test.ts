import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Player } from './player';
import { InputSource } from '../types/input-source';
import { Hand } from '../types/hand';
import { IOManager } from '../io-manager/io-manager';
import { card, Rank } from '../types/card';
import { FileIO } from '../io-manager/file-input';
import { StdIO } from '../io-manager/stdin-input';

jest.mock('../io-manager/file-input', () => ({
    FileIO: jest.fn().mockImplementation(() => ({
        readLine: jest.fn(),
        cleanup: jest.fn(),
    })),
}));

jest.mock('../io-manager/stdin-input', () => ({
    StdIO: jest.fn().mockImplementation(() => ({
        readLine: jest.fn(),
        cleanup: jest.fn(),
    })),
}));

describe('player', () => {
    let player: Player;
    const startingChips: number = 600

    const mockIO: IOManager = {
        readLine: jest.fn<() => Promise<string>>().mockResolvedValue('H'),
        cleanup: jest.fn(),
    } as any; // as any to disable type check since this is just a mock

    beforeEach(() => {
        player = new Player('test', startingChips, '', '', mockIO);
    });

    describe('Player constructor', () => {
        it('uses FileIO when inputSource is File', () => {
            const player = new Player('test', startingChips, InputSource.File, '/tmp/test.txt');
            expect(FileIO).toHaveBeenCalledWith('/tmp/test.txt');
            expect((player as any).ioManager).toBeDefined();
        });

        it('uses StdIO when inputSource is Stdin', () => {
            const player = new Player('test', startingChips, InputSource.Stdin);
            expect(StdIO).toHaveBeenCalledWith();
            expect((player as any).ioManager).toBeDefined();
        });

        it('throws when file input is requested without a file path', () => {
            expect(() => new Player('test', startingChips, InputSource.File))
                .toThrow('File path needed to use file input');
        });

        it('throws when an unknown input source is provided', () => {
            expect(() => new Player('test', startingChips, 'unknown'))
                .toThrow('Invalid input source');
        });
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
            mockIO.readLine = jest.fn<() => Promise<string | null>>().mockResolvedValue(null);
            await expect(player.makeMove(0))
                .rejects
                .toThrow("Input is null likely because the file has ended");
        });

        it('throws if move is not allowed', async () => {
            player.newHand(100);
            mockIO.readLine = jest.fn<() => Promise<string | null>>().mockResolvedValue("HELLO");
            await expect(player.makeMove(0))
                .rejects
                .toThrow("Move HELLO is not allowed");
        });

        it('allows double when the hand has two cards and the player has enough chips', async () => {
            player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Six));
            player.getHand(0).addCard(card(Rank.Four));

            mockIO.readLine = jest.fn<() => Promise<string | null>>()
                .mockResolvedValue('D');

            await expect(player.makeMove(0)).resolves.toBe('D');
        });

        it('does not allow double when the player does not have enough chips', async () => {
            player = new Player('test', startingChips - 1, '', '', mockIO);
            player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Six));
            player.getHand(0).addCard(card(Rank.Four));

            mockIO.readLine = jest.fn<() => Promise<string | null>>()
                .mockResolvedValue('D');

            await expect(player.makeMove(0))
                .rejects
                .toThrow('Move D is not allowed');
        });

        it('allows split when the hand has two cards, enough chips, and is a pair', async () => {
            player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Eight));
            player.getHand(0).addCard(card(Rank.Eight));

            mockIO.readLine = jest.fn<() => Promise<string | null>>()
                .mockResolvedValue('P');

            await expect(player.makeMove(0)).resolves.toBe('P');
        });

        it('does not allow split when the hand is not a pair', async () => {
           player.newHand(startingChips);
            player.getHand(0).addCard(card(Rank.Eight));
            player.getHand(0).addCard(card(Rank.Nine));

            mockIO.readLine = jest.fn<() => Promise<string | null>>()
                .mockResolvedValue('P');

            await expect(player.makeMove(0))
                .rejects
                .toThrow('Move P is not allowed');
        });
    });

    describe('makeBet', () => {
        it('asks the player to make a bet', async () => {
            mockIO.readLine = jest.fn<() => Promise<string | null>>().mockResolvedValue('100');
            expect(await player.makeBet()).toEqual(100);
            expect(player.getChips()).toEqual(startingChips - 100);
        });

        it('throws if the bet is null', async () => {
            mockIO.readLine = jest.fn<() => Promise<string | null>>().mockResolvedValue(null);
            await expect(player.makeBet())
                .rejects
                .toThrow("Input is null likely because the file has ended");
        });

        it('throws if the bet is empty', async () => {
            mockIO.readLine = jest.fn<() => Promise<string | null>>()
                .mockResolvedValue('');

            await expect(player.makeBet())
                .rejects
                .toThrow("Input is null likely because the file has ended");
        });

        it('throws if the bet is not a number', async () => {
            mockIO.readLine = jest.fn<() => Promise<string | null>>()
                .mockResolvedValue('abc');

            await expect(player.makeBet())
                .rejects
                .toThrow("Not a number");
        });

        it('throws if the bet exceeds available chips', async () => {
            mockIO.readLine = jest.fn<() => Promise<string | null>>()
                .mockResolvedValue((startingChips + 1).toString());

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

    it('cleans up properly', () => {
        player.cleanup();
        expect(mockIO.cleanup).toHaveBeenCalled();
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