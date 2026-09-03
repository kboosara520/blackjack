import { Hand, HandType, Move } from "../types/hand";
import { GameInput } from "../communication/game-input";

export class Player {
    protected hands: Hand[] = [];

    constructor(
        public readonly id: number,
        public readonly name: string, 
        private chips: number, 
        private readonly gameInput: GameInput
    ) {}

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
        let move: Move = await this.gameInput.waitForMove(this.id, handIdx);
        if (!this.isAllowedMove(move, this.getHand(handIdx))) throw new Error(`Move ${move} is not allowed`);
        return move;
    }

    // Provide input when doubling down or splitting
    public async makeBet(forcedBetSize?: number): Promise<number> {
        // get input
        let betSize: number;
        if (!forcedBetSize) {
            betSize = await this.gameInput.waitForBet(this.id);
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

    public isDone(): boolean {
        let allHandsDone = true;
        for (const hand of this.hands) {
            allHandsDone = allHandsDone && hand.getIsDone();
        }
        return allHandsDone;
    }

    private isAllowedMove(move: Move, hand: Hand): boolean {
        const allowedMoves = this.getAllowedMoves(hand);
        return allowedMoves.has(move);
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
