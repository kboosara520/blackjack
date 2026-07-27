import { beforeEach, describe, expect, it } from '@jest/globals';
import { card, Rank, Suit } from './types/card';
import { shoe, discardedPile, drawCard, initShoeForTesting, revealCard, initShoe, checkForReshuffle, discard } from './shoe';

describe('shoe', () => {
    beforeEach(() => {
        initShoeForTesting([
            card(Rank.Ace, Suit.Spades, false),
            card(Rank.King, Suit.Hearts, false),
            card(Rank.Five, Suit.Diamonds, false),
        ]);
    });

    it('initializes the right number of card', () => {
        initShoe(4, 60);
        expect(shoe.length).toEqual((4 * 52) - 1); // burn first card
    });

    it('reshuffles shoe when there are not enough cards left', () => {
        initShoe(1, 50);
        for (let i = 0; i < 26; i++) {
            discard(drawCard());
        }

        expect(shoe.length).toEqual(25);
        expect(discardedPile.length).toEqual(27);

        checkForReshuffle();

        expect(shoe.length).toEqual(51);
        expect(discardedPile.length).toEqual(1);
    });

    it('does nothing when there are enough cards left', () => {
        initShoe(1, 50);
        for (let i = 0; i < 25; i++) {
            discard(drawCard());
        }

        expect(shoe.length).toEqual(26);
        expect(discardedPile.length).toEqual(26);

        checkForReshuffle();

        expect(shoe.length).toEqual(26);
        expect(discardedPile.length).toEqual(26);
    })

    it('draws the top card and flips it face up by default', () => {
        const drawn = drawCard();
        expect(drawn).toMatchObject({ rank: Rank.Five, suit: Suit.Diamonds, isFaceUp: true });
    });

    it('respects explicit isFaceUp when drawing a card', () => {
        const drawn = drawCard(false);
        expect(drawn.isFaceUp).toBe(false);
    });

    it('reveals a face-down card', () => {
        const drawn = drawCard(false);
        expect(() => revealCard(drawn)).not.toThrow();
        expect(drawn.isFaceUp).toBe(true);
    });

    it('throws when revealing a card that is already face up', () => {
        const drawn = drawCard();
        expect(() => revealCard(drawn)).toThrow('Cannot reveal card that is already face up');
    });

    it('throws when the shoe is empty', () => {
        drawCard();
        drawCard();
        drawCard();
        expect(() => drawCard()).toThrow('Shoe is empty');
    });
});
