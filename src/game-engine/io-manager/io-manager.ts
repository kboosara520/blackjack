export interface IOManager {
    readLine(prompt: string): Promise<string | null>;
    output(str: string): void;
    cleanup(): void;
}
