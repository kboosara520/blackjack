import { card, Card, Rank, Suit } from "./card";
import { getCardVal } from "./hand";

let shoe: Card[];
let discardedPile: Card[] = [];
let penetration: number;
let runningCount: number = 0;

export function initShoe(noOfDecks: number, penetrationInput: number): void {
    shoe = [];
    penetration = penetrationInput;
    for (const rank of Object.values(Rank)) {
        for (const suit of Object.values(Suit)) {
            for (let i = 0; i < noOfDecks; i++) {
                shoe.push(card(rank, suit));
            }
        }
    }
    shuffle();
}

export function initShoeForTesting(cards: Card[]): void {
    runningCount = 0;
    shoe = [];
    for (const card of cards) {
        updateRunningCount(card);
    }
}

export function drawCard(isFaceUp?: boolean): Card {
    const card: Card | undefined = shoe.pop();
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
        updateRunningCount(card);
    }

    return card;
}

export function revealCard(card: Card): void {
    if (card.isFaceUp == true) {
        throw new Error("Cannot reveal card that is already face up");
    }
    card.isFaceUp = true;
    updateRunningCount(card);
}

export function discard(card: Card): void {
    discardedPile.push(card);
}

function shuffle() {
    // reset runningCount
    runningCount = 0;
    if (isEmpty()) throw new Error("The shoe is undefined or empty.");
    for (let i = shoe.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        let tmp: Card = shoe[i];
        shoe[i] = shoe[j];
        shoe[j] = tmp;
    }

    // burn first card
    console.log("Burned first card");
    const firstCard: Card | undefined = shoe.pop();
    if (!firstCard) {
        throw new Error("Shoe is empty after shuffling");
    }
    discard(firstCard);
}

function isEmpty() {
    return !shoe || shoe.length == 0;
}

function updateRunningCount(card: Card): void {
    const cardVal: number = getCardVal(card);
    if (cardVal <= 6) {
        runningCount += 1;
    }
    else if (cardVal >= 10) {
        runningCount -= 1;
    }
}
