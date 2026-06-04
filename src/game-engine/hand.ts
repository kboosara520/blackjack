import { Card, Rank } from "./card";

export const HandType = {
    Hard: "hard",
    Soft: "soft",
    Pair: "pair",
} as const;
export type HandType = typeof HandType[keyof typeof HandType];

export const Move = {
    Hit: "H",
    Stand: "S",
    Double: "D",
    DoubleOrHit: "Dh",
    DoubleOrStand: "Ds",
    Split: "P",
    Surrender: "Sur"
} as const;
export type Move = typeof Move[keyof typeof Move];

export class Hand {
    private cards: Card[] = [];
    private betSize: number = 0;

    // When a hand is inactive, the player can't make anymore moves for that hand, but the hand hasn't won or lost yet
    private isActive: boolean = true;

    // When a hand is done, it is over for the round, and whether the hand won or lost is determined
    private isDone: boolean = false;

    constructor(cards: Card[], betSize: number) {
        this.cards = cards;
        this.betSize = betSize;
    }

    public addCard(card: Card): void {
        this.cards.push(card);
    }

    public getTotal(): number {
        let sum = 0;
        let aceCount = 0;
        for (const card of this.cards) {
            if (card.rank === Rank.Ace) aceCount += 1;
            sum += getVal(card.rank);
        }
        while (aceCount > 0) {
            if (sum <= 21) break;
            sum -= 10;
            aceCount -= 1;
        }
        return sum;
    }

    public getBetSize(): number {
        return this.betSize;
    }

    public setBetSize(betSize: number) {
        this.betSize = betSize;
    }

    public getIsActive(): boolean {
        return this.isActive;
    }

    public setInactive() {
        this.isActive = false;
    }

    public getIsDone(): boolean {
        return this.isDone;
    }

    public setDone() {
        this.setInactive();
        this.isDone = true;
    }

    public getHandType(): HandType {
        if (this.cards.length === 2 && getVal(this.cards[0].rank) == getVal(this.cards[1].rank)) return HandType.Pair;
        if (this.cards.some(card => card.rank === Rank.Ace)) return HandType.Soft; // At least one ace in the hand
        return HandType.Hard;
    }

    // only used when splitting
    public removeOneCard(): Card {
        const card: Card | undefined = this.cards.pop();
        if (!card || this.cards.length != 1) {
            throw new Error("Should not be called unless we are splitting the hand.");
        }
        return card;
    }

    public getCards(): Card[] {
        return this.cards;
    }

    public setCards(cards: Card[]): void {
        this.cards = cards;
    }
};

export function getVal(rank: Rank): number {
    if (rank === Rank.Jack || rank === Rank.Queen || rank === Rank.King) return 10;
    if (rank === Rank.Ace) return 11;
    return parseInt(rank, 10);
}

export function getCardVal(card: Card): number {
    return getVal(card.rank);
}
