import { getHandType, handTotal } from "./hand";
import { Card, HandType, Move, StrategyTable } from "./types";

export function getMove(hand: Card[], dealerCard: Card, strategyTable: Readonly<StrategyTable>): Move {
    const handType = getHandType(hand);
    if (handType === HandType.Pair) {
        return strategyTable[handType][hand[0].rank][dealerCard.rank];
    }
    return strategyTable[handType][handTotal(hand).toString(10)][dealerCard.rank];
}
