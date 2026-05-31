import { Card, Rank } from "./card";
import { getHandType, handTotal, HandType } from "./hand";

export const Move = {
    Hit: "H",
    Stand: "S",
    DoubleOrHit: "D",
    DoubleOrStand: "Ds",
    Split: "P",
    Surrender: "Sur"
} as const;
export type Move = typeof Move[keyof typeof Move];

// table[handType][handTotal][dealerCardFace] = correct move
export type StrategyTable = Record<HandType, Record<string, Record<Rank, Move>>>;

export function getMove(hand: Card[], dealerCard: Card, strategyTable: Readonly<StrategyTable>): Move {
    const handType = getHandType(hand);
    if (handType === HandType.Pair) {
        return strategyTable[handType][hand[0].rank][dealerCard.rank];
    }
    return strategyTable[handType][handTotal(hand).toString(10)][dealerCard.rank];
}
