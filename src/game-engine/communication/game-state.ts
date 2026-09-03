import { Card } from "../types/card";

export interface HandState {
    cards: Card[];
    total: number;
    betSize: number;
    isActive: boolean;
    isDone: boolean;
};

export interface PlayerState {
    index: number;
    name: string;
    chips: number;
    hands: HandState[];
};

export interface DealerState {
    cards: Card[];
};

export interface GameState {
    phase: string,
    players: PlayerState[];
    dealer: DealerState;
};
