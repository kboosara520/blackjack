import { IOManager } from "./io-manager";

export class NoneIO implements IOManager {
    public async readLine(prompt: string): Promise<string | null> {
        return Promise.resolve("");
    }
    public async output(str: string): Promise<void> {
        // Intentionally left blank
    }
    public cleanup(): void {
        return;
    }
}