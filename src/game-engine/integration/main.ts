import { Game, RuleSet } from "../game";

const game: Game = new Game("normal", RuleSet.S17WithSurrender, 75, 1, 4);

async function main() {
    try {
        while (true) {
            await game.playRound();
        }
    }
    finally {
        game.cleanup();
    }
}

main().catch(console.error);
