import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Shoe } from './shoe';

describe('shoe', () => {
    let testShoe: Shoe;

    beforeEach(() => {
        testShoe = new Shoe(1, 50);
    });

    it('initializes with one fewer card after burning the first card', () => {
        const fourDeckShoe = new Shoe(4, 60);

        let cardsDrawn = 0;
        while (!fourDeckShoe.isEmpty()) {
            fourDeckShoe.drawCard();
            cardsDrawn++;
        }

        expect(cardsDrawn).toBe((4 * 52) - 1);
    });

    it('reshuffles shoe when there are not enough cards left', () => {
        const shuffle = jest.spyOn(testShoe, 'shuffle');

        for (let i = 0; i < 26; i++) {
            testShoe.discard(testShoe.drawCard());
        }

        testShoe.checkForReshuffle();

        expect(shuffle).toHaveBeenCalledTimes(1);
    });

    it('does nothing when there are enough cards left', () => {
        const shuffle = jest.spyOn(testShoe, 'shuffle');

        for (let i = 0; i < 25; i++) {
            testShoe.discard(testShoe.drawCard());
        }

        testShoe.checkForReshuffle();

        expect(shuffle).not.toHaveBeenCalled();
    });

    it('draws the top card and flips it face up by default', () => {
        const drawn = testShoe.drawCard();

        expect(drawn.isFaceUp).toBe(true);
    });

    it('respects explicit isFaceUp when drawing a card', () => {
        const drawn = testShoe.drawCard(false);

        expect(drawn.isFaceUp).toBe(false);
    });

    it('throws when the shoe is empty', () => {
        while (!testShoe.isEmpty()) {
            testShoe.drawCard();
        }

        expect(() => testShoe.drawCard()).toThrow('Shoe is empty');
    });
});
