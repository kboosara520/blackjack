import { describe, expect, it, jest } from '@jest/globals';
import { NoneIO } from './none-io';

describe('NoneIO', () => {
    it('returns an empty string from readLine', async () => {
        const noneIO = new NoneIO();

        await expect(noneIO.readLine('Prompt: ')).resolves.toBe('');
    });

    it('does not output anything', async () => {
        const log = jest.spyOn(console, 'log');
        const noneIO = new NoneIO();

        await expect(noneIO.output('Hidden output')).resolves.toBeUndefined();
        expect(log).not.toHaveBeenCalled();

        log.mockRestore();
    });

    it('does nothing during cleanup', () => {
        const noneIO = new NoneIO();

        expect(() => noneIO.cleanup()).not.toThrow();
    });
});
