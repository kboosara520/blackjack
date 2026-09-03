import { GameEvent } from "./game-event";
import { GameEventSink } from "./game-event-sink";

export class TerminalEventSink implements GameEventSink {
    public publish(event: GameEvent): void {
        if (event.type === "message") {
            console.log(event.text);
        }
        else {
            console.log(event);
        }
    }
}