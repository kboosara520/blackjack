import { beforeAll, describe, expect, it } from '@jest/globals';
import { getMove, Move, StrategyTable } from "./basicStrategy";
import { S17NoSurrenderCases } from "./testCases/S17NoSurrenderCases";
import fs from "node:fs";
import path from "node:path";
import { S17WithSurrenderCases } from './testCases/S17WithSurrenderCases';
import { HandType } from './hand';
import { Rank } from './card';

function loadStrategy(name: string): StrategyTable {
  const filePath = path.join(__dirname, "charts", `${name}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as StrategyTable;
}

let strategyTable: StrategyTable;

let tables: StrategyTable[] = [];

describe("Validate tables", () => {
    beforeAll(() => {
        tables.push(loadStrategy("S17NoSurrender"));
        tables.push(loadStrategy("S17WithSurrender"));
    });

    it("each table has entries for hard, soft, and pair", () => {
        for (const table of tables) {
            expect(table).toBeDefined();
            for (const handType of Object.values(HandType)) {
                expect(handType in table).toBe(true);
            }
        }
    });

    it("each table's hard subtable has an entry for 4 - 20", () => {
        const hardTotals = Array.from({ length: 17 }, (_, i) => (i + 4).toString());
        for (const table of tables) {
            const hard = table.hard;
            for (const total of hardTotals) {
                expect(hard).toHaveProperty(total);
            }
        }
    });

    it("each table's soft subtable has an entry for 13 - 20", () => {
        const softTotals = Array.from({ length: 8 }, (_, i) => (i + 13).toString());
        for (const table of tables) {
            const soft = table.soft;
            for (const total of softTotals) {
                expect(soft).toHaveProperty(total);
            }
        }
    });

    it("each table's pair subtable has an entry for 2 - A", () => {
        const possiblePairs = Object.values(Rank);
        for (const table of tables) {
            const pairSubTable = table.pair;
            for (const p of possiblePairs) {
                expect(pairSubTable).toHaveProperty(p);
            }
        }
    });

    it("every move in every table is a valid move", () => {
        const validMoves = new Set(Object.values(Move));
        for (const table of tables) {
            for (const handType of Object.values(HandType)) {
                const subtable = table[handType];
                for (const row of Object.values(subtable)) {
                    for (const move of Object.values(row)) {
                        expect(validMoves.has(move)).toBe(true);
                    }
                }
            }
        }
    });
});

describe("S17 no surrender", () => {
    beforeAll(() => {
        strategyTable = loadStrategy("S17NoSurrender");
    });

    it.each(S17NoSurrenderCases)("$name", ({ hand, dealerCard, expected }) => {
        expect(getMove(hand, dealerCard, strategyTable)).toEqual(expected);
    });

    it("Has no surrenders", () => {
        for (const handType of Object.values(HandType)) {
            const subtable = strategyTable[handType];
            for (const row of Object.values(subtable)) {
                for (const move of Object.values(row)) {
                    expect(move).not.toEqual(Move.Surrender);
                }
            }
        }
    });
});

describe("S17 with surrender", () => {
    beforeAll(() => {
        strategyTable = loadStrategy("S17WithSurrender");
    });

    it.each(S17WithSurrenderCases)("$name", ({ hand, dealerCard, expected }) => {
        expect(getMove(hand, dealerCard, strategyTable)).toEqual(expected);
    });
});
