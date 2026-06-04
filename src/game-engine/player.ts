import { Hand, Move } from "./hand";

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

    // Provide input when doubling down or splitting
    public makeBet(forcedBetSize?: number): number {
        // get input
        let betSize: number;
        if (!forcedBetSize) {
            betSize = 25;
        }
        else {
            betSize = forcedBetSize;
        }

        if (betSize > this.chips) {
            throw new Error(`${this.name} does not have enough chips`);
        }
        this.chips -= betSize;
        return betSize;
    }

    public winChips(payout: number): void {
        this.chips += payout;
    }

    public isActive(): boolean {
        return this.hands.some(hand => hand.getIsActive());
    }

    public getChips(): number {
        return this.chips;
    }

    public emptyHands() {
        this.hands = [];
    }
};
