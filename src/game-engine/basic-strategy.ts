import { Card, Rank } from "./card";
import { Hand, HandType, Move } from "./hand";

// table[handType][handTotal][dealerCardFace] = correct move
export type StrategyTable = Record<HandType, Record<string, Record<Rank, Move>>>;

export function getMove(hand: Hand, dealerCard: Card, strategyTable: Readonly<StrategyTable>): Move {
    const handType = hand.getHandType();
    if (handType === HandType.Pair) {
        return strategyTable[handType][hand.getCards()[0].rank][dealerCard.rank];
    }
    return strategyTable[handType][hand.getTotal().toString(10)][dealerCard.rank];
}
