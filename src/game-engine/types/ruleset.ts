export const RuleSet = {
    S17NoSurrrender: "s17NoSurrender",
    S17WithSurrender: "s17WithSurrender"
};
export type RuleSet = typeof RuleSet[keyof typeof RuleSet];
