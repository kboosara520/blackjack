import { Move } from "./basic-strategy";
import { Card } from "./card";

export class Player {
    public readonly name: string;
    protected hand: Card[] = [];
    private canHit: boolean = false;
    private isActive: boolean = false;
    private chips: number;

    constructor(name: string, chips: number) {
        this.name = name;
        this.chips = chips;
    }

    public addCard(card: Card) {
        this.hand.push(card);
    }

    public makeMove(): Move {
        // get input
        return "H"
    }

    public makeBet(): number {
        // get input
        return 0;
    }
};
