import { Game } from "../game";
import { GameMode } from "../types/game-mode";
import { RuleSet } from "../types/ruleset";

const game: Game = new Game(GameMode.Normal, RuleSet.S17WithSurrender, 75, 1, 4);

async function main() {
    try {
        await game.playRound();
    }
    finally {
        game.cleanup();
    }
}

main().catch(console.error);
