import { Game } from "../game";
import { StdIO } from "../io-manager/stdin-input";
import { Player } from "../participants/player";
import { GameMode } from "../types/game-mode";
import { RuleSet } from "../types/ruleset";

const stdIO = new StdIO();
const players = [new Player("Player 0", 1000, stdIO)];

const game: Game = new Game(
    GameMode.Normal,
    RuleSet.S17WithSurrender,
    75,
    players,
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
