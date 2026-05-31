import { card, Card, Rank, Suit } from "./card";
import { Dealer } from "./dealer";
import { Player } from "./player";

export const GameMode = {
    Normal: "normal",
    Practice: "practice"
} as const;
export type GameMode = typeof GameMode[keyof typeof GameMode];

export const RuleSet = {
    S17NoSurrrender: "s17NoSurrender",
    S17WithSurrender: "s17WithSurrender"
};
export type RuleSet = typeof RuleSet[keyof typeof RuleSet];

export class Game {
    private gameMode: GameMode;
    private ruleSet: RuleSet;
    private shoe: Card[] = [];
    private discardedPile: Card[] = [];
    private readonly penetration: number;
    private players: Player[] = [];

    constructor(
        gameMode: GameMode, 
        ruleSet: RuleSet, 
        penetration: number,
        noOfPlayers: number, 
        noOfDecks: number
    ) {
        this.gameMode = gameMode;
        this.ruleSet = ruleSet;
        this.penetration = penetration;

        for (const rank of Object.values(Rank)) {
            for (const suit of Object.values(Suit)) {
                for (let i = 0; i < noOfDecks; i++) {
                    this.shoe.push(card(rank, suit));
                }
            }
        }

        // just for development
        for (let i = 0; i < noOfPlayers; i++) {
            const name: string = `Player ${i}`;
            this.players.push(new Player(name, 1000));
        }

        this.shuffleShoe();
    }

    public run(): void {
        const dealer: Dealer = new Dealer(this.ruleSet);
    }

    private shuffleShoe() {
        for (let i = this.shoe.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            let tmp: Card = this.shoe[i];
            this.shoe[i] = this.shoe[j];
            this.shoe[j] = tmp;
        }
    }
}