import { card, Card, Rank, Suit } from "./card";
import { Dealer } from "./dealer";
import { Hand } from "./hand";
import { processHands } from "./hands-processor";
import { Player } from "./player";
import { drawCard, initShoe } from "./shoe";

export const GameMode = {
    Normal: "normal",
    Practice: "practice"
} as const;
export type GameMode = typeof GameMode[keyof typeof GameMode];

export const RuleSet = {
    S17NoSurrrender: "s17NoSurrender",
    S17WithSurrender: "s17WithSurrender"
};
export type RuleSet = typeof RuleSet[keyof typeof RuleSet];

export class Game {
    private gameMode: GameMode;
    private ruleSet: RuleSet;
    private readonly penetration: number;
    private dealer: Dealer;
    private players: Player[] = [];

    constructor(
        gameMode: GameMode, 
        ruleSet: RuleSet, 
        penetration: number,
        noOfPlayers: number, 
        noOfDecks: number
    ) {
        this.gameMode = gameMode;
        this.ruleSet = ruleSet;
        this.penetration = penetration;

        initShoe(noOfDecks, penetration);

        this.dealer = new Dealer(this.ruleSet);

        // just for development
        for (let i = 0; i < noOfPlayers; i++) {
            const name: string = `Player ${i}`;
            this.players.push(new Player(name, 1000));
        }
    }

    public playRound(): void {

        // everyone bets
        for (const player of this.players) {
            player.makeBet();
        }

        // deal cards
        this.dealOneForEachPlayer();
        this.dealer.addCard(drawCard(true));
        this.dealOneForEachPlayer();
        this.dealer.addCard(drawCard(false));

        // if the dealer has ace, check the other card for a blackjack
        // check players for blackjacks

        // players make moves
        for (const player of this.players) {
            processHands(player);
        }
        
        // dealer makes moves
        processHands(this.dealer);

        // compare hand totals and pay winners
    }

    // only use at the start
    private dealOneForEachPlayer() {
        let card: Card;
        for (const player of this.players) {
            card = drawCard(true);
            player.getHands()[0].addCard(card);
        }
    }
}