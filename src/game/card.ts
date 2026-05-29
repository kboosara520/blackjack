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

export const Suit = {
    Clubs: "clubs",
    Diamonds: "diamonds",
    Hearts: "hearts",
    Spades: "spades"
}
export type Suit = typeof Suit[keyof typeof Suit];

export type Card = {
    rank: Rank;
    suit: Suit;
};

export function card(rank: Rank, suit?: Suit): Card {
    if (suit) return { rank: rank, suit: suit };
    return { rank: rank, suit: Suit.Spades };
}
