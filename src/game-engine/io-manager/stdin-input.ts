import readline from "readline";
import { IOManager } from "./io-manager";

export class StdinIO implements IOManager {
    private rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    public async readLine(): Promise<string | null> {
        return new Promise((resolve) => {
            this.rl.question("", (answer) => {
                resolve(answer);
            });
        });
    }

    public output(str: string): void {
        console.log(str);
    }

    public cleanup(): void {
        this.rl.close();
    }
}
