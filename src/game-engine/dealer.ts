import { Move } from "./basic-strategy";
import { RuleSet } from "./game";
import { handTotal } from "./hand";
import { Player } from "./player";

const s17: Set<RuleSet> = new Set<RuleSet>([RuleSet.S17NoSurrrender, RuleSet.S17WithSurrender]);

export class Dealer extends Player {
    private ruleSet: RuleSet;

    constructor(ruleSet: RuleSet) {
        super("Dealer", 0);
        this.ruleSet = ruleSet;
    }

    public override makeMove(): Move {
        if (s17.has(this.ruleSet)) {
            if (handTotal(this.hand) >= 17) {
                return "S";
            }
            return "H";
        }
        throw new Error("dealer move error");
    }
};
