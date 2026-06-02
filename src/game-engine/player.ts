import { Move } from "./basic-strategy";
import { Card } from "./card";
import { Hand } from "./hand";

export class Player {
    public readonly name: string;
    protected hands: Hand[] = [];
    private chips: number;

    constructor(name: string, chips: number) {
        this.name = name;
        this.chips = chips;
    }

    public getHand(handIdx: number) {
        if (handIdx >= this.hands.length) {
            throw new Error("Index out of bounds");
        }
        return this.hands[handIdx];
    }

    public getHands(): Hand[] {
        return this.hands;
    }

    public makeMove(): Move {
        // get input
        return "H"
    }

    public makeBet(): void {
        // get input
        const betSize: number = 25;
        this.chips -= betSize;
        this.hands[0].setBetSize(betSize);
    }

    public isActive(): boolean {
        return this.hands.some(hand => hand.getIsActive());
    }

    public getChips(): number {
        return this.chips;
    }

    public setChips(chips: number): void {
        this.chips = chips;
    }
};
