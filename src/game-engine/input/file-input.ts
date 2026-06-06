import fs from "fs";
import readline from "readline";

export class FileInput {
    private iterator: AsyncIterator<string>;

    constructor(filePath: string) {
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity,
        });

        this.iterator = rl[Symbol.asyncIterator]();
    }

    public async readLine(): Promise<string | null> {
        const result = await this.iterator.next();
        return result.done ? null : result.value;
    }    
}