import { IOManager } from "../io-manager/io-manager";
import { isMove, Move } from "../types/hand";
import { GameInput } from "./game-input";

export class TerminalInput implements GameInput {
    constructor(private readonly ioManager: IOManager) {}

    public async waitForBet(playerId: number): Promise<number> {
        const input: string | null = await this.ioManager.readLine("Make a bet: ")
        if (!input) throw new Error("Input is null likely because the file has ended");
        const betSize = Number(input);
        if (Number.isNaN(betSize)) throw new Error("Not a number");
        return betSize;
    }

    public async waitForMove(playerId: number, handIndex: number): Promise<Move> {
        let input: string | null = await this.ioManager.readLine("Make a move: ")
        if (!input) throw new Error("Input is null likely because the file has ended");
        if (!isMove(input)) throw new Error(`Invalid move: ${input}`);
        return input;
    }
};