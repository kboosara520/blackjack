import { describe, expect, it, jest } from '@jest/globals';
import { Dealer } from './dealer';
import { card, Rank } from '../types/card';
import { Move } from '../types/hand';
import { RuleSet } from '../types/ruleset';
import { GameInput } from '../communication/game-input';

const gameInput: GameInput = {
	waitForBet: jest.fn<() => Promise<number>>(),
	waitForMove: jest.fn<() => Promise<Move>>(),
};

function createDealer(ruleSet: RuleSet): Dealer {
	return new Dealer(ruleSet, gameInput);
}

describe('dealer', () => {
	it('starts with one empty active hand', () => {
		const dealer = createDealer(RuleSet.S17NoSurrrender);

		expect(dealer.getHands()).toHaveLength(1);
		expect(dealer.getHand(0).length()).toBe(0);
		expect(dealer.getHand(0).getIsActive()).toBe(true);
	});

	it('adds cards and can retrieve them', () => {
		const dealer = createDealer(RuleSet.S17NoSurrrender);
		const firstCard = card(Rank.Two);
		const secondCard = card(Rank.Five);

		dealer.addCard(firstCard);
		dealer.addCard(secondCard);

		expect(dealer.getCard(0)).toBe(firstCard);
		expect(dealer.getCard(1)).toBe(secondCard);
		expect(dealer.getHand(0).getTotal()).toBe(7);
	});

	it('hits when the hand total is below 17', async () => {
		const dealer = createDealer(RuleSet.S17NoSurrrender);
		dealer.addCard(card(Rank.Seven));
		dealer.addCard(card(Rank.Nine));

		await expect(dealer.makeMove(0)).resolves.toBe(Move.Hit);
	});

	it('stands when the hand total is 17', async () => {
		const dealer = createDealer(RuleSet.S17NoSurrrender);
		dealer.addCard(card(Rank.Eight));
		dealer.addCard(card(Rank.Nine));

		await expect(dealer.makeMove(0)).resolves.toBe(Move.Stand);
	});

	it('stands when the hand total is above 17', async () => {
		const dealer = createDealer(RuleSet.S17WithSurrender);
		dealer.addCard(card(Rank.Ten));
		dealer.addCard(card(Rank.Nine));

		await expect(dealer.makeMove(0)).resolves.toBe(Move.Stand);
	});

	it('throws for an unsupported rule set', async () => {
		const dealer = createDealer('unsupported' as RuleSet);

		await expect(dealer.makeMove(0)).rejects.toThrow('dealer move error');
	});

	it('resets to one empty hand when hands are emptied', () => {
		const dealer = createDealer(RuleSet.S17NoSurrrender);
		dealer.addCard(card(Rank.King));

		dealer.emptyHands();

		expect(dealer.getHands()).toHaveLength(1);
		expect(dealer.getHand(0).length()).toBe(0);
		expect(dealer.getHand(0).getIsActive()).toBe(true);
	});
});
