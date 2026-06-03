import { Move } from "./basic-strategy";
import { Card } from "./card";
import { Hand, HandType } from "./hand";
import { Player } from "./player";
import { drawCard } from "./shoe";

type MoveHandler = (player: Player, handIdx: number) => void;

export function processHands(player: Player): void {
    let i: number = 0;
    const hands: Hand[] = player.getHands();
    while (i < hands.length) {
        const move: Move = player.makeMove();
        processMove(player, i, move);
        const hand: Hand = player.getHand(i);
        if (!hand.getIsActive() || hand.getIsDone()) {
            i++;
        }
    }
}

function processMove(player: Player, handIdx: number, move: Move): void {
    const handler: MoveHandler | undefined = moveHandlerMap.get(move);
    if (!handler) {
        throw new Error(`Invalid move ${move}.`);
    }
    handler(player, handIdx);
}

const handleHit: MoveHandler = (player, handIdx) => {
    console.log(`${player.name} hits.`);

    const hand: Hand = player.getHand(handIdx);
    const card: Card = drawCard();
    hand.addCard(card);

    const total: number = hand.getTotal();
    if (total > 21) {
        console.log(`${player.name} busts`);
        hand.setDone();
    }
}

const handleStand: MoveHandler = (player, handIdx) => {
    console.log(`${player.name} stands.`);
    player.getHand(handIdx).setInactive();
}

const handleDouble: MoveHandler = (player, handIdx) => {
    console.log(`${player.name} doubles down.`);

    const hand: Hand = player.getHand(handIdx);
    if (player.getChips() < hand.getBetSize()) {
        throw new Error(`${player.name} does not have enough chips.`);
    }

    player.setChips(player.getChips() - hand.getBetSize());
    hand.setBetSize(hand.getBetSize() * 2);

    const card: Card = drawCard();
    hand.addCard(card);
    const total: number = hand.getTotal();
    if (total > 21) {
        console.log(`${player.name} busts`);
        hand.setDone();
    }
    else {
        hand.setInactive();
    }
}

const handleSplit: MoveHandler = (player, handIdx) => {
    console.log(`${player.name} splits hand ${handIdx}.`);
    const hands: Hand[] = player.getHands();
    const hand1: Hand = hands[handIdx];
    if (hand1.getHandType() != HandType.Pair) {
        throw new Error(`${player.name}'s hand ${handIdx} is not a pair, therefore, it can't be split.`);
    }
    if (player.getChips() < hand1.getBetSize()) {
        throw new Error(`${player.name} does not have enough chips.`);
    }

    player.setChips(player.getChips() - hand1.getBetSize());

    // take 1 card from hand1 and put into hand2
    const hand2: Hand = new Hand([hand1.removeOneCard()], hand1.getBetSize());
    // insert hand2
    hands.splice(handIdx + 1, 0, hand2);

    hand1.addCard(drawCard());
    hand2.addCard(drawCard());
}

const moveHandlerMap = new Map<Move, MoveHandler>([
    [Move.Hit, handleHit],
    [Move.Stand, handleStand],
    [Move.Double, handleDouble],
    [Move.Split, handleSplit]
]);
