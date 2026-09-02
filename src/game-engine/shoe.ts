import { card, Card, Rank, Suit } from "./types/card";
import { getCardVal } from "./types/hand";

export class Shoe {
    private cards: Card[];
    private discardedPile: Card[] = [];
    private runningCount: number = 0;
    private numCardsBeforeReshuffle: number; // number of cards left before reshuffle

    constructor(private readonly noOfDecks: number, private readonly penetration: number) {
        this.cards = [];
        this.numCardsBeforeReshuffle = Math.round(noOfDecks * 52 * ((100 - this.penetration) / 100));
        for (const rank of Object.values(Rank)) {
            for (const suit of Object.values(Suit)) {
                for (let i = 0; i < noOfDecks; i++) {
                    this.cards.push(card(rank, suit));
                }
            }
        }
        this.shuffle();
    }

    public drawCard(isFaceUp?: boolean): Card {
        const card: Card | undefined = this.cards.pop();
        if (!card) {
            // reshuffle the cards
            throw new Error("Shoe is empty");
        }

        if (isFaceUp === undefined) {
            card.isFaceUp = true;
        }
        else {
            card.isFaceUp = isFaceUp;
        }

        if (card.isFaceUp) {
            this.updateRunningCount(card);
        }

        return card;
    }

    public checkForReshuffle(): void {
        if (this.cards.length < this.numCardsBeforeReshuffle) {
            this.cards = this.cards.concat(this.discardedPile);
            this.discardedPile = [];
            this.shuffle();
        }
    }

    public shuffle(): void {
        this.runningCount = 0;
        if (this.isEmpty()) throw new Error("The shoe is undefined or empty.");
        for (let i = this.cards.length - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            let tmp: Card = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = tmp;
        }

        // burn first card
        const firstCard: Card = this.cards.pop()!;
        this.discard(firstCard);
    }

    public discard(card: Card): void {
        this.discardedPile.push(card);
    }

    public updateRunningCount(card: Card) {
        const cardVal: number = getCardVal(card);
        if (cardVal <= 6) {
            this.runningCount += 1;
        }
        else if (cardVal >= 10) {
            this.runningCount -= 1;
        }
    }

    public isEmpty(): boolean {
        return !this.cards || this.cards.length == 0;
    }

    public getRunningCount(): number {
        return this.runningCount;
    }
};
