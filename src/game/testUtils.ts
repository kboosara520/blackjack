import { Card, Move, Rank } from "./types";

export type Case = {
    name: string;
    hand: Card[];
    dealerCard: Card;
    expected: Move;
};

export function card(rank: Rank): Card {
    return { rank: rank };
}