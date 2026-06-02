import { Card, Rank } from "./card";


export class Hand {
    private cards: Card[] = [];
    private isActive: boolean = true;
    private isDone: boolean = false;
    private betSize: number = 0;

    constructor(cards: Card[], betSize: number) {
        this.cards = cards;
        this.betSize = betSize;
    }

    public addCard(card: Card): void {
        this.cards.push(card);
    }

    public getTotal(): number {
        return handTotal(this.cards);
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
        return getHandType(this.cards);
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

export const HandType = {
    Hard: "hard",
    Soft: "soft",
    Pair: "pair",
} as const;
export type HandType = typeof HandType[keyof typeof HandType];

export function getHandType(hand: Card[]): HandType {
    if (hand.length === 2 && getVal(hand[0].rank) == getVal(hand[1].rank)) return HandType.Pair;
    if (hand.some(card => card.rank === Rank.Ace)) return HandType.Soft; // At least one ace in the hand
    return HandType.Hard;
}

export function handTotal(hand: Card[]): number {
    let sum = 0;
    let aceCount = 0;
    for (const card of hand) {
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

export function getVal(rank: Rank): number {
    if (rank === Rank.Jack || rank === Rank.Queen || rank === Rank.King) return 10;
    if (rank === Rank.Ace) return 11;
    return parseInt(rank, 10);
}
