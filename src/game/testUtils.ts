import { Move } from "./basicStrategy";
import { Card } from "./card";

export type BasicStrategyTestCase = {
    name: string;
    hand: Card[];
    dealerCard: Card;
    expected: Move;
};