import { Card, HandType, Rank } from "./types";

export function getHandType(hand: Card[]): HandType {
    if (hand.length === 2 && getVal(hand[0].rank) == getVal(hand[1].rank)) return HandType.Pair;
    if (hand.some(card => card.rank === Rank.Ace)) return HandType.Soft; // At least one ace in the hand
    return HandType.Hard;
}

export function handTotal(hand: Card[]): number {
    let sum = 0;
    let aceCount = 0;
    for (const card of hand) {
        if (card.rank === Rank.Ace) aceCount += 1;
        sum += getVal(card.rank);
    }
    while (aceCount > 0) {
        if (sum <= 21) break;
        sum -= 10;
        aceCount -= 1;
    }
    return sum;
}

export function getVal(rank: Rank): number {
    if (rank === Rank.Jack || rank === Rank.Queen || rank === Rank.King) return 10;
    if (rank === Rank.Ace) return 11;
    return parseInt(rank, 10);
}
