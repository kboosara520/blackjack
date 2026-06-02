import { card, Card, Rank, Suit } from "./card";

let shoe: Card[];
let discardedPile: Card[] = [];
let penetration: number;

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

export function drawCard(isFaceUp?: boolean): Card {
    const card: Card | undefined = shoe.pop();
    if (!card) {
        // reshuffle the cards
        throw new Error("Shoe is empty");
    }
    if (isFaceUp === undefined) card.isFaceUp = true;
    else card.isFaceUp = isFaceUp;
    return card;
}

export function discard(card: Card): void {
    discardedPile.push(card);
}

function shuffle() {
    if (isEmpty()) throw new Error("The shoe is undefined or empty.");
    for (let i = shoe.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        let tmp: Card = shoe[i];
        shoe[i] = shoe[j];
        shoe[j] = tmp;
    }
}

function isEmpty() {
    return !shoe || shoe.length == 0;
}
