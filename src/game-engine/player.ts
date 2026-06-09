import { Hand, Move } from "./hand";
import { FileIO } from "./io-manager/file-input";
import { IOManager } from "./io-manager/io-manager";
import { MockIO } from "./io-manager/mock-input";
import { StdinIO } from "./io-manager/stdin-input";
import { InputSource } from "./input-source";

export class Player {
    public readonly name: string;
    protected hands: Hand[] = [];
    private chips: number;
    private ioManagaer: IOManager;

    constructor(name: string, chips: number, inputSource: InputSource, filePath?: string) {
        this.name = name;
        this.chips = chips;
        switch(inputSource) {
            case InputSource.File:
                if (!filePath) throw new Error("File path needed to use file input");
                this.ioManagaer = new FileIO(filePath);
                break;
            case InputSource.Stdin:
                this.ioManagaer = new StdinIO();
                break;
            case InputSource.Mock:
                this.ioManagaer = new MockIO();
                break;
            default:
                console.log(inputSource);
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
            move = await this.ioManagaer.readLine("Make a move: ")
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

    public cleanup() {
        this.ioManagaer.cleanup();
    }
};

function isAllowedMove(value: string, allowedMoves: Set<Move>): value is Move {
  return allowedMoves.has(value as Move);
}
