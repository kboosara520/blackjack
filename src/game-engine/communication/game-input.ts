import { Move } from "../types/hand";

export interface GameInput {
    waitForBet(playerId: number): Promise<number>;
    // submitBet(playerId: number, amount: number): void;

    waitForMove(playerId: number, handIndex: number): Promise<Move>;
    // submitMove(playerId: number, handIndex: number, move: Move): void;
}