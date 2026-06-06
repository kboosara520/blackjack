import { Hand, Move } from "./hand";
import { FileInput } from "./input/file-input";
import { InputProvider, InputSource } from "./input/input-provider";
import { MockInput } from "./input/mock-input";
import { StdinInput } from "./input/stdin-input";

export class Player {
    public readonly name: string;
    protected hands: Hand[] = [];
    private chips: number;
    private inputSource: InputProvider;

    constructor(name: string, chips: number, inputSource: InputSource, filePath?: string) {
        this.name = name;
        this.chips = chips;
        switch(inputSource) {
            case InputSource.File:
                if (!filePath) throw new Error("File path needed to use file input");
                this.inputSource = new FileInput(filePath);

            case InputSource.Stdin:
                this.inputSource = new StdinInput();

            case InputSource.Mock:
                this.inputSource = new MockInput();

            default:
                throw new Error("Invalid input source");
        }
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

    public async makeMove(allowedMoves: Set<Move>): Promise<Move> {
        let move: string | null = "";
        while (!isAllowedMove(move, allowedMoves)) {
            move = await this.inputSource.readLine("Make a move: ")
            if (!move) throw new Error("Input is null likely because the file has ended");
        }
        return move;
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

function isAllowedMove(value: string, allowedMoves: Set<Move>): value is Move {
  return Object.values(allowedMoves).includes(value as Move);
}
