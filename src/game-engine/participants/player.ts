import { Hand, HandType, Move } from "../types/hand";
import { IOManager } from "../io-manager/io-manager";

export class Player {
    public readonly name: string;
    protected hands: Hand[] = [];
    private chips: number;
    private ioManager: IOManager;

    constructor(
        name: string, 
        chips: number, 
        ioManager: IOManager,
    ) {
        this.name = name;
        this.chips = chips;
        this.ioManager = ioManager;
    }

    public newHand(betSize: number): void {
        this.hands.push(new Hand([], betSize));
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

    public async makeMove(handIdx: number): Promise<Move> {
        let move: string | null = await this.ioManager.readLine("Make a move: ")
        if (!move) throw new Error("Input is null likely because the file has ended");
        if (!this.isAllowedMove(move, this.getHand(handIdx))) throw new Error(`Move ${move} is not allowed`);
        return move;
    }

    // Provide input when doubling down or splitting
    public async makeBet(forcedBetSize?: number): Promise<number> {
        // get input
        let betSize: number;
        if (!forcedBetSize) {
            const input: string | null = await this.ioManager.readLine("Make a bet: ")
            if (!input) throw new Error("Input is null likely because the file has ended");
            betSize = Number(input);
            if (Number.isNaN(betSize)) throw new Error("Not a number");
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

    private isAllowedMove(value: string, hand: Hand): value is Move{
        const allowedMoves = this.getAllowedMoves(hand);
        return allowedMoves.has(value as Move);
    }

    private getAllowedMoves(hand: Hand): Set<Move> {
        const allowedMoves: Set<Move> = new Set<Move>();
        allowedMoves.add(Move.Hit);
        allowedMoves.add(Move.Stand);
        if (hand.length() == 2 && this.getChips() >= hand.getBetSize()) {
            allowedMoves.add(Move.Double);
            if (hand.getHandType() === HandType.Pair) {
                allowedMoves.add(Move.Split);
            }
        }
        return allowedMoves;
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

    public emptyHands(): void {
        this.hands = [];
    }
};
