import { beforeAll, describe, expect, it } from '@jest/globals';
import { getHandType, handTotal, getVal, HandType } from "./hand";
import { card, Card, Rank } from './card';

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

describe("getHandType", () => {

    const cases: { name: string, hand: Card[], type: HandType }[] = [
        {
            name: "classifies a hard hand",
            hand: [card(Rank.Seven), card(Rank.Nine)],
            type: "hard"
        },
        {
            name: "classifies a soft hand when an ace is present",
            hand: [card(Rank.Five), card(Rank.Ace), card(Rank.Six)],
            type: "soft"
        },
        {
            name: "classifies a pair hand when two ranks match",
            hand: [card(Rank.Eight), card(Rank.Eight)],
            type: "pair"
        },
        {
            name: "classifies 10s with different rank as a pair",
            hand: [card(Rank.Jack), card(Rank.Queen)],
            type: "pair"
        }
    ];

    it.each(cases)("$name", ({ hand, type }) => {
        expect(getHandType(hand)).toEqual(type);
    });
});

describe("handTotal", () => {
    let hardHand: Card[];
    let softHand: Card[];
    let multiAceSoftHand: Card[];
    let multiCardSoftHand: Card[];
    let bustHand: Card[];

    beforeAll(() => {
        hardHand = [card(Rank.Seven), card(Rank.Nine)];
        softHand = [card(Rank.Ace), card(Rank.Six)];
        multiAceSoftHand = [card(Rank.Ace), card(Rank.Ace), card(Rank.Ace), card(Rank.Eight)];
        multiCardSoftHand = [card(Rank.Ace), card(Rank.Seven), card(Rank.Two)];
        bustHand = [card(Rank.Jack), card(Rank.Queen), card(Rank.King), card(Rank.Ace)];
    });

    it("calculates a hard total correctly", () => {
        expect(handTotal(hardHand)).toBe(16);
    });

    it("calculates a soft total with ace as 11", () => {
        expect(handTotal(softHand)).toBe(17);
    });

    it("reduces multiple aces correctly to avoid busting", () => {
        expect(handTotal(multiAceSoftHand)).toBe(21);
    });

    it("calculates totals for a soft hand with more than two cards", () => {
        expect(handTotal(multiCardSoftHand)).toBe(20);
    });

    it("calculates the total of a bust", () => {
        expect(handTotal(bustHand)).toBe(31);
    });
});
