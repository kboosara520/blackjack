import { Card} from "./card";
import { Dealer } from "./dealer";
import { getCardVal, Hand } from "./hand";
import { processHands } from "./hands-processor";
import { Player } from "./player";
import { discard, drawCard, initShoe } from "./shoe";

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
            const betSize: number = player.makeBet();
            player.getHands().push(new Hand([], betSize));
        }

        // deal cards
        this.dealOneForEachPlayer();
        this.dealer.addCard(drawCard(true));
        this.dealOneForEachPlayer();
        this.dealer.addCard(drawCard(false));

        // if the dealer has ace, check the other card for a blackjack
        const dealerFirstCardVal: number = getCardVal(this.dealer.getCard(0));
        if (dealerFirstCardVal == 10 || dealerFirstCardVal == 11) {
            if (this.dealer.getHand(0).getTotal() == 21) {
                // reveal card
                this.handleDealerBlackjack();
                this.cleanup();
                return;
            }
        }

        // check players for blackjacks
        this.checkForBlackjacks();

        // players make moves
        for (const player of this.players) {
            processHands(player);
        }
        
        // dealer makes moves
        processHands(this.dealer);

        // compare hand totals and pay winners
        const dealerTotal: number = this.dealer.getHand(0).getTotal();
        console.log(`The dealer's total is ${dealerTotal}`);

        if (dealerTotal > 21) {
            this.handleDealerBust();
        }
        else {
            this.handleNormalCalculations(dealerTotal);
        }

        this.cleanup();
    }

    // only use at the start
    private dealOneForEachPlayer(): void {
        let card: Card;
        for (const player of this.players) {
            card = drawCard(true);
            player.getHands()[0].addCard(card);
        }
    }

    private handleDealerBlackjack(): void {
        for (const player of this.players) {
            const hand: Hand = player.getHand(0);
            if (player.getHand(0).getTotal() == 21) {
                const betSize: number = hand.getBetSize();
                console.log(`The dealer pushes ${player.name}'s blackjack`);
                player.winChips(betSize);
            }
            else {
                console.log(`${player.name} loses`);
            }
            hand.setDone();
        }
    }

    private checkForBlackjacks(): void {
        for (const player of this.players) {
            const hand: Hand = player.getHand(0);
            if (player.getHand(0).getTotal() == 21) {
                const betSize: number = hand.getBetSize();
                // blackjack pays 3:2
                console.log(`${player.name} gets a blackjack and wins ${betSize * 1.5}`);
                // 1 from the inital bet, 1.5 from 3:2 payout
                player.winChips(betSize * 2.5);
                hand.setDone();
            }
        }
    }

    private handleDealerBust(): void {
        console.log("The dealer busts");
        for (const player of this.players) {
            const hands: Hand[] = player.getHands();
            for (const hand of hands) {
                if (hand.getIsDone()) continue;
                // if the hand is still in the game, the hand wins
                console.log(`${player.name} wins ${hand.getBetSize()}`);
                player.winChips(hand.getBetSize() * 2);
                hand.setDone();
            }
        }
    }

    private handleNormalCalculations(dealerTotal: number) {
        for (const player of this.players) {
            const hands: Hand[] = player.getHands();
            for (const [idx, hand] of hands.entries()) {
                if (hand.getIsDone()) continue;

                const handTotal: number = hand.getTotal();
                const betSize: number = hand.getBetSize();
                const playerNameHandNo: string = `${player.name}'s hand ${idx + 1}`;
                if (handTotal > dealerTotal) {
                    console.log(`${playerNameHandNo} wins ${hand.getBetSize()}`);
                    player.winChips(betSize * 2);
                }
                else if (handTotal == dealerTotal) {
                    console.log(`The dealer pushes ${playerNameHandNo}`);
                    player.winChips(betSize);
                }
                else {
                    console.log(`${playerNameHandNo} loses`);
                }
                hand.setDone();
            }
        }
    }

    private cleanup() {
        this.dealer.getHand(0).getCards().forEach((card) => discard(card));
        this.dealer.emptyHands();
        
        this.players.forEach((player) => {
            player.getHands().forEach((hand) => {
                hand.getCards().forEach((card) => {
                    discard(card);
                });
            });
            player.emptyHands();
        });
    }
}