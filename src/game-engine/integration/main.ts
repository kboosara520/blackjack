import { TerminalEventSink } from "../communication/terminal-event-sink";
import { TerminalInput } from "../communication/terminal-input";
import { Game } from "../game";
import { StdIO } from "../io-manager/stdin-input";
import { Player } from "../participants/player";
import { GameMode } from "../types/game-mode";
import { RuleSet } from "../types/ruleset";

const stdIO = new StdIO();
const terminalInput = new TerminalInput(stdIO);
const players = [new Player(0, "Player 0", 1000, terminalInput)];

const game: Game = new Game(
    GameMode.Normal,
    RuleSet.S17WithSurrender,
    75,
    players,
    4,
    new TerminalEventSink(),
    terminalInput,
);

async function main() {
    try {
        while (true) {
            await game.playRound();
        }
    }
    finally {
        stdIO.cleanup();
    }
}

main().catch(console.error);
