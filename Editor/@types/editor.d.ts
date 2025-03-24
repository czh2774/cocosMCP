declare global {
    const Editor: {
        Message: {
            addBroadcastListener(message: string, callback: Function): void;
            removeBroadcastListener(message: string, callback: Function): void;
            request(module: string, method: string, ...args: any[]): Promise<any>;
            send(message: string, ...args: any[]): Promise<void>;
            broadcast(message: string, ...args: any[]): Promise<void>;
        };

        Logger: {
            query(): Promise<LogEntry[]>;
            clear(): Promise<void>;
        };

        Console: {
            QueryResult: {
                logs: LogEntry[];
            };
            clear(): Promise<void>;
            create(): Promise<void>;
            remove(uuid: string): Promise<void>;
        };
    };
}

export interface LogEntry {
    type: 'log' | 'warn' | 'error';
    message: string;
    stack?: string;
    date: Date;
}

export {}; 