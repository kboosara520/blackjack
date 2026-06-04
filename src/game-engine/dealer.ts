import { Card } from "./card";
import { RuleSet } from "./game";
import { Move } from "./hand";
import { Player } from "./player";

const s17: Set<RuleSet> = new Set<RuleSet>([RuleSet.S17NoSurrrender, RuleSet.S17WithSurrender]);

export class Dealer extends Player {
    private ruleSet: RuleSet;

    constructor(ruleSet: RuleSet) {
        super("Dealer", 0);
        this.ruleSet = ruleSet;
    }

    public getCard(idx: number): Card {
        return this.hands[0].getCards()[idx];
    }

    public addCard(card: Card): void {
        this.hands[0].addCard(card);
    }

    public override makeMove(): Move {
        if (s17.has(this.ruleSet)) {
            if (this.hands[0].getTotal() >= 17) {
                return "S";
            }
            return "H";
        }
        throw new Error("dealer move error");
    }
};
