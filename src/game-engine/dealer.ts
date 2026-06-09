import { Card } from "./card";
import { RuleSet } from "./ruleset";
import { Hand, Move } from "./hand";
import { Player } from "./player";
import { InputSource } from "./input-source";

const s17: Set<RuleSet> = new Set<RuleSet>([RuleSet.S17NoSurrrender, RuleSet.S17WithSurrender]);

export class Dealer extends Player {
    private ruleSet: RuleSet;

    constructor(ruleSet: RuleSet) {
        super("Dealer", 0, InputSource.Mock);
        this.ruleSet = ruleSet;
        this.hands.push(new Hand([], 0));
    }

    public getCard(idx: number): Card {
        return this.hands[0].getCards()[idx];
    }

    public addCard(card: Card): void {
        this.hands[0].addCard(card);
    }

    public override makeMove(_: Set<Move>): Promise<Move> {
        if (s17.has(this.ruleSet)) {
            if (this.hands[0].getTotal() >= 17) {
                return Promise.resolve(Move.Stand);
            }
            return Promise.resolve(Move.Hit);
        }
        throw new Error("dealer move error");
    }
};
