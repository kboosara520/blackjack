import { GameEvent } from "./game-event";

export interface GameEventSink {
    publish(event: GameEvent): void;
};