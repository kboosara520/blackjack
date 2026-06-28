import { StdIO } from "./stdin-input";
import { describe, expect, it } from '@jest/globals';

describe("StdIO", () => {
    it("reuses a single console input interface", () => {
        const first = new StdIO();
        const second = new StdIO();

        expect(first).toBe(second);

        first.cleanup();
        second.cleanup();
    });
});
