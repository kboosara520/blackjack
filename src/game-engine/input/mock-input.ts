export class MockInput {
    public async readLine(prompt: string): Promise<string | null> {
        return Promise.resolve("");
    }

    public cleanup(): void {} // do nothing for now
}