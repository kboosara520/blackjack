import { describe, expect, it } from '@jest/globals';
import { getVal, Hand, HandType } from "./hand";
import { card, Rank } from './card';

describe("getVal", () => {
    it("returns numeric values for numbered cards", () => {
        expect(getVal(Rank.Two)).toBe(2);
        expect(getVal(Rank.Five)).toBe(5);
        expect(getVal(Rank.Ten)).toBe(10);
    });

    it("returns 10 for face cards", () => {
        expect(getVal(Rank.Jack)).toBe(10);
        expect(getVal(Rank.Queen)).toBe(10);
        expect(getVal(Rank.King)).toBe(10);
    });

    it("returns 11 for Ace", () => {
        expect(getVal(Rank.Ace)).toBe(11);
    });
});

describe("Hand.getHandType", () => {
    const cases: { name: string, hand: Hand, type: HandType }[] = [
        {
            name: "classifies a hard hand",
            hand: new Hand([card(Rank.Seven), card(Rank.Nine)], 0),
            type: "hard"
        },
        {
            name: "classifies a soft hand when an ace is present",
            hand: new Hand([card(Rank.Five), card(Rank.Ace), card(Rank.Six)], 0),
            type: "soft"
        },
        {
            name: "classifies a pair hand when two ranks match",
            hand: new Hand([card(Rank.Eight), card(Rank.Eight)], 0),
            type: "pair"
        },
        {
            name: "classifies 10s with different rank as a pair",
            hand: new Hand([card(Rank.Jack), card(Rank.Queen)], 0),
            type: "pair"
        }
    ];

    it.each(cases)("$name", ({ hand, type }) => {
        expect(hand.getHandType()).toEqual(type);
    });
});

describe("handTotal", () => {
    const cases: { name: string, hand: Hand, value: number }[] = [
        {
            name: "calculates a hard total correctly", 
            hand: new Hand([card(Rank.Seven), card(Rank.Nine)], 0),
            value: 16
        },
        {
            name: "calculates a soft total with ace as 11",
            hand: new Hand([card(Rank.Ace), card(Rank.Six)], 0),
            value: 17
        },
        {
            name: "reduces multiple aces correctly to avoid busting",
            hand: new Hand([card(Rank.Ace), card(Rank.Ace), card(Rank.Ace), card(Rank.Eight)], 0),
            value: 21
        },
        {
            name: "calculates totals for a soft hand with more than two cards",
            hand: new Hand([card(Rank.Ace), card(Rank.Seven), card(Rank.Two)], 0),
            value: 20
        },
        {
            name: "calculates the total of a bust",
            hand: new Hand([card(Rank.Jack), card(Rank.Queen), card(Rank.King), card(Rank.Ace)], 0),
            value: 31
        }
    ];

    it.each(cases)("$name", ({ hand, value }) => {
        expect(hand.getTotal()).toBe(value);
    });
});

describe("Hand state helpers", () => {
    it("adds cards and tracks hand length", () => {
        const hand = new Hand([], 10);

        hand.addCard(card(Rank.Five));
        hand.addCard(card(Rank.Ace));

        expect(hand.length()).toBe(2);
        expect(hand.getCards()).toHaveLength(2);
    });

    it("stores and updates the bet size", () => {
        const hand = new Hand([], 10);

        expect(hand.getBetSize()).toBe(10);

        hand.setBetSize(25);

        expect(hand.getBetSize()).toBe(25);
    });

    it("tracks active and done states", () => {
        const hand = new Hand([], 0);

        expect(hand.getIsActive()).toBe(true);
        expect(hand.getIsDone()).toBe(false);

        hand.setInactive();
        expect(hand.getIsActive()).toBe(false);

        hand.setDone();
        expect(hand.getIsActive()).toBe(false);
        expect(hand.getIsDone()).toBe(true);
    });

    it("removes one card when splitting", () => {
        const hand = new Hand([card(Rank.Two), card(Rank.Three)], 0);

        const removed = hand.removeOneCard();

        expect(removed.rank).toBe(Rank.Three);
        expect(hand.length()).toBe(1);
    });

    it("throws when removeOneCard is called in an invalid state", () => {
        const hand = new Hand([card(Rank.Two)], 0);

        expect(() => hand.removeOneCard()).toThrow("Should not be called unless we are splitting the hand.");
    });

    it("replaces cards and formats them as a string", () => {
        const hand = new Hand([card(Rank.Ace)], 0);
        const cards = [card(Rank.Two), card(Rank.Three)];

        hand.setCards(cards);

        expect(hand.getCards()).toEqual(cards);
        expect(hand.toString()).toBe("2 of spades, 3 of spades");
    });
});
