import { describe, expect, it } from '@jest/globals';
import { card, Rank, Suit } from './card';

describe("card builder", () => {
    it("builds a card", () => {
        const rank: Rank = "5";
        const suit: Suit = "hearts";
        const isFaceUp: boolean = false;
        expect(card(rank, suit, isFaceUp)).toStrictEqual({ rank: rank, suit: suit, isFaceUp: isFaceUp});
    });

    it("sets the suit to spades when the suit isn't specified", () => {
        const rank: Rank = "K";
        const isFaceUp: boolean = false;
        expect(card(rank, undefined, isFaceUp).suit).toStrictEqual(Suit.Spades);
    });

    it("sets the card to face up when not specified", () => {
        const rank: Rank = "K";
        const suit: Suit = "hearts";
        expect(card(rank, suit).isFaceUp).toBe(true);
    })
});
