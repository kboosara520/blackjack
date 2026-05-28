export const Move = {
    Hit: "H",
    Stand: "S",
    DoubleOrHit: "D",
    DoubleOrStand: "Ds",
    Split: "P",
    Surrender: "Sur"
} as const;

export type Move = typeof Move[keyof typeof Move];

export const Rank = {
    Ace: "A",
    Two: "2",
    Three: "3",
    Four: "4",
    Five: "5",
    Six: "6",
    Seven: "7",
    Eight: "8",
    Nine: "9",
    Ten: "10",
    Jack: "J",
    Queen: "Q",
    King: "K",
} as const;

export type Rank = typeof Rank[keyof typeof Rank];

export const HandType = {
    Hard: "hard",
    Soft: "soft",
    Pair: "pair",
} as const;

export type HandType = typeof HandType[keyof typeof HandType];

export type Card = {
    rank: Rank;
};

// table[handType][handTotal][dealerCardFace] = correct move
export type StrategyTable = Record<HandType, Record<string, Record<Rank, Move>>>;
