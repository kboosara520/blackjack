import { GameState } from "./game-state";

export type GameEvent = 
    {
        type: "message";
        text: string;
    } |
    {
        type: "state_changed";
        state: GameState;
    } |
    {
        type: "bet_required";
    } |
    {
        type: "move_required";
        playerId: number;
        handIndex: number;
    }