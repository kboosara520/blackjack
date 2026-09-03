import { Card, cardToString } from "./types/card";
import { Dealer } from "./participants/dealer";
import { GameMode } from "./types/game-mode";
import { getCardVal, Hand } from "./types/hand";
import { processHands } from "./hands-processor";
import { IOManager } from "./io-manager/io-manager";
import { Player } from "./participants/player";
import { RuleSet } from "./types/ruleset";
import { Shoe } from "./shoe";

export class Game {
    private readonly dealer: Dealer;
    private readonly shoe: Shoe;

    constructor(
        private readonly gameMode: GameMode, 
        private readonly ruleSet: RuleSet, 
        private readonly penetration: number,
        private readonly players: Player[], 
        noOfDecks: number,
        private readonly ioManager: IOManager
    ) {
        this.shoe = new Shoe(noOfDecks, penetration);
        this.dealer = new Dealer(this.ruleSet);
    }

    public async playRound(): Promise<void> {

        // everyone bets
        for (const player of this.players) {
            const betSize: number = await player.makeBet();
            player.newHand(betSize);
        }

        this.shoe.checkForReshuffle();

        // deal cards
        this.dealOneForEachPlayer();
        this.dealer.addCard(this.shoe.drawCard(true));
        this.dealOneForEachPlayer();
        this.dealer.addCard(this.shoe.drawCard(false));

        await this.ioManager.output(`Dealer's first card: ${cardToString(this.dealer.getCard(0))}`);

        // if the dealer has ace, check the other card for a blackjack
        const dealerFirstCardVal: number = getCardVal(this.dealer.getCard(0));
        if (dealerFirstCardVal == 10 || dealerFirstCardVal == 11) {
            if (this.dealer.getHand(0).getTotal() == 21) {
                // reveal card
                await this.handleDealerBlackjack();
                this.endRound();
                return;
            }
        }

        // check players for blackjacks
        await this.checkForBlackjacks();

        // players make moves
        for (const player of this.players) {
            await processHands(player, this.shoe, this.ioManager);
        }

        let allPlayerBust = true;
        for (const player of this.players) {
            allPlayerBust = allPlayerBust && player.isDone();
        }

        console.log(allPlayerBust);

        const dealerHand: Hand = this.dealer.getHand(0);
        this.revealCard(dealerHand.getCards()[1]);

        if (!allPlayerBust) {
            // dealer makes moves
            await processHands(this.dealer, this.shoe, this.ioManager);
    
            // compare hand totals and pay winners
            const dealerTotal: number = this.dealer.getHand(0).getTotal();
            await this.ioManager.output(`The dealer's total is ${dealerTotal}`);
    
            if (dealerTotal > 21) {
                await this.handleDealerBust();
            }
            else {
                await this.handleNormalCalculations(dealerTotal);
            }

        }
        this.endRound();
    }

    // only use at the start
    private dealOneForEachPlayer(): void {
        let card: Card;
        for (const player of this.players) {
            card = this.shoe.drawCard(true);
            player.getHands()[0].addCard(card);
        }
    }

    private async handleDealerBlackjack(): Promise<void> {
        for (const player of this.players) {
            const hand: Hand = player.getHand(0);
            if (player.getHand(0).getTotal() == 21) {
                const betSize: number = hand.getBetSize();
                await this.ioManager.output(`The dealer pushes ${player.name}'s blackjack`);
                player.winChips(betSize);
            }
            else {
                await this.ioManager.output(`${player.name} loses`);
            }
            hand.setDone();
        }
    }

    private async checkForBlackjacks(): Promise<void> {
        for (const player of this.players) {
            const hand: Hand = player.getHand(0);
            if (player.getHand(0).getTotal() == 21) {
                const betSize: number = hand.getBetSize();
                // blackjack pays 3:2
                await this.ioManager.output(`${player.name} gets a blackjack and wins ${betSize * 1.5}`);
                // 1 from the inital bet, 1.5 from 3:2 payout
                player.winChips(betSize * 2.5);
                hand.setDone();
            }
        }
    }

    private async handleDealerBust(): Promise<void> {
        await this.ioManager.output("The dealer busts");
        for (const player of this.players) {
            const hands: Hand[] = player.getHands();
            for (const hand of hands) {
                if (hand.getIsDone()) continue;
                // if the hand is still in the game, the hand wins
                await this.ioManager.output(`${player.name} wins ${hand.getBetSize()}`);
                player.winChips(hand.getBetSize() * 2);
                hand.setDone();
            }
        }
    }

    private async handleNormalCalculations(dealerTotal: number): Promise<void> {
        for (const player of this.players) {
            const hands: Hand[] = player.getHands();
            for (const [idx, hand] of hands.entries()) {
                if (hand.getIsDone()) continue;

                const handTotal: number = hand.getTotal();
                const betSize: number = hand.getBetSize();
                const playerNameHandNo: string = `${player.name}'s hand ${idx + 1}`;
                if (handTotal > dealerTotal) {
                    await this.ioManager.output(`${playerNameHandNo} wins ${hand.getBetSize()}`);
                    player.winChips(betSize * 2);
                }
                else if (handTotal == dealerTotal) {
                    await this.ioManager.output(`The dealer pushes ${playerNameHandNo}`);
                    player.winChips(betSize);
                }
                else {
                    await this.ioManager.output(`${playerNameHandNo} loses`);
                }
                hand.setDone();
            }
        }
    }

    private revealCard(card: Card) {
        if (card.isFaceUp == true) {
            throw new Error("Cannot reveal card that is already face up");
        }
        card.isFaceUp = true;
        this.shoe.updateRunningCount(card);
    }

    private endRound() {
        this.dealer.getHand(0).getCards().forEach((card: Card) => this.shoe.discard(card));
        this.dealer.emptyHands();
        
        this.players.forEach((player) => {
            player.getHands().forEach((hand) => {
                hand.getCards().forEach((card: Card) => {
                    this.shoe.discard(card);
                });
            });
            player.emptyHands();
        });
    }
}

export { RuleSet };
