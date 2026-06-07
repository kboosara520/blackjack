import readline from "readline";

export class StdinInput {
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

    public cleanup(): void {
        this.rl.close();
    }
}
