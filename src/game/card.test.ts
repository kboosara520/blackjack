import { describe, expect, it } from '@jest/globals';
import { card, Rank, Suit } from './card';

describe("card builder", () => {
    it("builds a card", () => {
        const rank: Rank = "5";
        const suit: Suit = "hearts";
        expect(card(rank, suit)).toStrictEqual({ rank: rank, suit: suit });
    });

    it("defaults to spades when the suit isn't specified", () => {
        const rank: Rank = "K";
        expect(card(rank)).toStrictEqual({ rank: rank, suit: Suit.Spades });
    });
});
