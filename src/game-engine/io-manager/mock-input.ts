import { IOManager } from "./io-manager";

export class MockIO implements IOManager {
    public async readLine(prompt: string): Promise<string | null> {
        return Promise.resolve("");
    }

    public output(str: string): void {}

    public cleanup(): void {} // do nothing for now
}