import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import readline from 'readline';
import { StdIO } from './stdin-input';

const question = jest.fn<(prompt: string, callback: (answer: string) => void) => void>();
const close = jest.fn();

jest.spyOn(readline, 'createInterface').mockReturnValue({
    question,
    close,
} as unknown as readline.Interface);

describe("StdIO", () => {
    beforeEach(() => {
        (StdIO as any).instance = null;
        question.mockReset();
        close.mockReset();
    });

    it("reuses a single console input interface", () => {
        const first = new StdIO();
        const second = new StdIO();

        expect(first).toBe(second);
        expect(readline.createInterface).toHaveBeenCalledTimes(1);

        first.cleanup();
        second.cleanup();
        expect(close).toHaveBeenCalledTimes(1);
    });

    it('resolves readLine with the answer from readline', async () => {
        question.mockImplementationOnce((_prompt, callback) => callback('hit'));
        const stdIO = new StdIO();

        await expect(stdIO.readLine('Make a move: ')).resolves.toBe('hit');
        expect(question).toHaveBeenCalledWith('Make a move: ', expect.any(Function));
    });

    it('rejects when the readline interface is null', async () => {
        const stdIO = new StdIO();

        (stdIO as any).rl = null;

        await expect(stdIO.readLine('Prompt: '))
            .rejects
            .toThrow('rl is null');
    });

    it('writes output to the console', async () => {
        const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
        const stdIO = new StdIO();

        await stdIO.output('Dealer stands.');

        expect(log).toHaveBeenCalledWith('Dealer stands.');
        log.mockRestore();
    });

    it('closes readline when the last user cleans up', () => {
        const first = new StdIO();
        const second = new StdIO();

        first.cleanup();
        expect(close).not.toHaveBeenCalled();

        second.cleanup();
        expect(close).toHaveBeenCalledTimes(1);
    });
});
