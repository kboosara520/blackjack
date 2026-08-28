import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import fs from 'fs';
import readline from 'readline';
import { FileIO } from './file-input';

const next = jest.fn<() => Promise<IteratorResult<string>>>();
const asyncIterator: AsyncIterator<string> = { next };
const readlineInterface = {
    [Symbol.asyncIterator]: () => asyncIterator,
};

const createReadStream = jest.spyOn(fs, 'createReadStream');
const createInterface = jest.spyOn(readline, 'createInterface');

describe('FileIO', () => {
    beforeEach(() => {
        next.mockReset();
        createReadStream.mockReset();
        createInterface.mockReset();
        createReadStream.mockReturnValue({} as fs.ReadStream);
        createInterface.mockReturnValue(readlineInterface as readline.Interface);
    });

    it('creates a readline interface for the provided file', () => {
        const filePath = '/tmp/input.txt';

        new FileIO(filePath);

        expect(createReadStream).toHaveBeenCalledWith(filePath);
        expect(createInterface).toHaveBeenCalledWith({
            input: expect.anything(),
            crlfDelay: Infinity,
        });
    });

    it('returns the next line from the file', async () => {
        next.mockResolvedValueOnce({ done: false, value: 'H' });
        const fileIO = new FileIO('/tmp/input.txt');

        await expect(fileIO.readLine('Make a move: ')).resolves.toBe('H');
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('returns null when the file has ended', async () => {
        next.mockResolvedValueOnce({ done: true, value: undefined });
        const fileIO = new FileIO('/tmp/input.txt');

        await expect(fileIO.readLine('Make a move: ')).resolves.toBeNull();
    });

    it('rejects when output is requested', async () => {
        const fileIO = new FileIO('/tmp/input.txt');

        await expect(fileIO.output('Some output'))
            .rejects
            .toThrow('Not implemented');
    });

    it('does nothing during cleanup', () => {
        const fileIO = new FileIO('/tmp/input.txt');

        expect(() => fileIO.cleanup()).not.toThrow();
    });
});
