import readline from "readline";
import { IOManager } from "./io-manager";

export class StdIO implements IOManager {
    private static instance: StdIO | null = null;
    private rl: readline.Interface | null = null;
    private users: number = 0;

    constructor() {
        if (StdIO.instance) {
            return StdIO.instance;
        }

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        StdIO.instance = this;
        this.users += 1;
    }

    public async readLine(prompt: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            const rl = this.rl;
            if (!rl) {
                reject(new Error("rl is null"));
                return;
            }
            rl.question(prompt, (answer) => {
                resolve(answer);
            });
        });
    }

    public output(str: string): void {
        console.log(str);
    }

    public cleanup(): void {
        this.users -= 1;
        if (this.rl && this.users == 0) {
            this.rl.close();
            // console.log("Closed stdin");
        }
    }
}
