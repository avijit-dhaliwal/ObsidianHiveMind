export class Logger {
    static log(message: string) {
        console.log(`[Hive Mind] ${message}`);
    }

    static error(message: string, error?: Error) {
        console.error(`[Hive Mind] Error: ${message}`, error);
    }

    static warn(message: string) {
        console.warn(`[Hive Mind] Warning: ${message}`);
    }
}