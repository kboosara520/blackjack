import { card, Card, Rank, Suit } from "./card";


class Game {
    shoe: Card[] = [];

    constructor(noOfDecks: number, penetration: number) {
        for (const rank of Object.values(Rank)) {
            for (const suit of Object.values(Suit)) {
                for (let i = 0; i < noOfDecks; i++) {
                    this.shoe.push(card(rank, suit));
                }
            }
        }
    }
}