import { Game } from "../game";
import { StdIO } from "../io-manager/stdin-input";
import { GameMode } from "../types/game-mode";
import { RuleSet } from "../types/ruleset";

const stdIO = new StdIO();

const game: Game = new Game(
    GameMode.Normal,
    RuleSet.S17WithSurrender,
    75,
    1,
    4,
    stdIO,
);

async function main() {
    try {
        await game.playRound();
    }
    finally {
        stdIO.cleanup();
    }
}

main().catch(console.error);
