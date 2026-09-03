import { Move } from "./types/hand";
import { Card } from "./types/card";
import { Hand, HandType } from "./types/hand";
import { Player } from "./participants/player";
import { Shoe } from "./shoe";
import { GameEventSink } from "./communication/game-event-sink";

type MoveHandler = (player: Player, handIdx: number, shoe: Shoe, gameEventSink: GameEventSink) => Promise<void>;

export async function processHands(player: Player, shoe: Shoe, gameEventSink: GameEventSink): Promise<void> {
    let i: number = 0;
    const hands: Hand[] = player.getHands();
    while (i < hands.length) {
        if (!hands[i].getIsActive()) continue;
        gameEventSink.publish({
            type: "message",
            text: `${player.name}'s hand: ${hands[i].toString()}`,
        });
        const move: Move = await player.makeMove(i);
        await processMove(player, i, move, shoe, gameEventSink);
        const hand: Hand = player.getHand(i);
        if (!hand.getIsActive() || hand.getIsDone()) {
            i++;
        }
    }
}

async function processMove(
    player: Player,
    handIdx: number,
    move: Move,
    shoe: Shoe,
    gameEventSink: GameEventSink
): Promise<void> {
    const handler: MoveHandler | undefined = moveHandlerMap.get(move);
    if (!handler) {
        throw new Error(`Invalid move ${move}.`);
    }
    await handler(player, handIdx, shoe, gameEventSink);
    const hand: Hand = player.getHand(handIdx);
    gameEventSink.publish({
        type: "message",
        text: `${player.name}'s hand: ${hand.toString()}`,
    });
}

const handleHit: MoveHandler = async (player, handIdx, shoe, gameEventSink) => {
    gameEventSink.publish({
        type: "message",
        text: `${player.name} hits.`,
    });

    const hand: Hand = player.getHand(handIdx);
    const card: Card = shoe.drawCard();
    hand.addCard(card);

    const total: number = hand.getTotal();
    if (total > 21) {
        gameEventSink.publish({
            type: "message",
            text: `${player.name} busts`,
        });
        hand.setDone();
    }
}

const handleStand: MoveHandler = async (player, handIdx, shoe, gameEventSink) => {
    gameEventSink.publish({
        type: "message",
        text: `${player.name} stands.`,
    });
    player.getHand(handIdx).setInactive();
}

const handleDouble: MoveHandler = async (player, handIdx, shoe, gameEventSink) => {
    gameEventSink.publish({
        type: "message",
        text: `${player.name} doubles down.`,
    });

    const hand: Hand = player.getHand(handIdx);
    if (player.getChips() < hand.getBetSize()) {
        throw new Error(`${player.name} does not have enough chips.`);
    }

    // force player to make another bet equal to current bet
    const bet: number = await player.makeBet(hand.getBetSize());
    hand.setBetSize(bet * 2);

    const card: Card = shoe.drawCard();
    hand.addCard(card);
    const total: number = hand.getTotal();
    if (total > 21) {
        gameEventSink.publish({
            type: "message",
            text: `${player.name} busts`,
        });
        hand.setDone();
    }
    else {
        hand.setInactive();
    }
}

const handleSplit: MoveHandler = async (player, handIdx, shoe, gameEventSink) => {
    gameEventSink.publish({
        type: "message",
        text: `${player.name} splits hand ${handIdx}.`,
    });
    const hands: Hand[] = player.getHands();
    const hand1: Hand = hands[handIdx];
    if (hand1.getHandType() != HandType.Pair) {
        throw new Error(`${player.name}'s hand ${handIdx} is not a pair, therefore, it can't be split.`);
    }
    if (player.getChips() < hand1.getBetSize()) {
        throw new Error(`${player.name} does not have enough chips.`);
    }

    const hand2Bet = await player.makeBet(hand1.getBetSize());

    // take 1 card from hand1 and put into hand2
    const hand2: Hand = new Hand([hand1.removeOneCard()], hand2Bet);
    // insert hand2
    hands.splice(handIdx + 1, 0, hand2);

    hand1.addCard(shoe.drawCard());
    hand2.addCard(shoe.drawCard());
}

const moveHandlerMap = new Map<Move, MoveHandler>([
    [Move.Hit, handleHit],
    [Move.Stand, handleStand],
    [Move.Double, handleDouble],
    [Move.Split, handleSplit]
]);
