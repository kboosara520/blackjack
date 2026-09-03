import { Card } from "../types/card";
import { RuleSet } from "../types/ruleset";
import { Hand, Move } from "../types/hand";
import { Player } from "./player";
import { GameInput } from "../communication/game-input";

const s17: Set<RuleSet> = new Set<RuleSet>([RuleSet.S17NoSurrrender, RuleSet.S17WithSurrender]);

export class Dealer extends Player {
    constructor(
        private readonly ruleSet: RuleSet,
        gameInput: GameInput,
    ) {
        super(-1, "Dealer", 0, gameInput);
        this.hands.push(new Hand([], 0));
    }

    public getCard(idx: number): Card {
        return this.hands[0].getCards()[idx];
    }

    public getCards(): Card[] {
        return this.hands[0].getCards();
    }

    public addCard(card: Card): void {
        this.hands[0].addCard(card);
    }

    public override async makeMove(_: number): Promise<Move> {
        if (s17.has(this.ruleSet)) {
            if (this.hands[0].getTotal() >= 17) {
                return Promise.resolve(Move.Stand);
            }
            return Promise.resolve(Move.Hit);
        }
        throw new Error("dealer move error");
    }

    public override emptyHands() {
        super.emptyHands();
        this.hands.push(new Hand([], 0));
    }
};
