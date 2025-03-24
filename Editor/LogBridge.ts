import * as net from 'net';
import { Config } from './config/Config';

interface LogEntry {
    type: 'log' | 'warn' | 'error';
    message: string;
    stack?: string;
    date: Date;
}

interface Command {
    type: string;
    params: any;
}

interface CommandResponse {
    status: string;
    result?: any;
    error?: string;
}

export class LogBridge {
    private static instance: LogBridge;
    private server!: net.Server;
    private isRunning: boolean = false;
    private commandHandlers: Map<string, (params: any) => Promise<any>> = new Map();

    private constructor() {
        this.setupCommandHandlers();
        this.startTcpServer();
        this.setupLogListener();
    }

    public static getInstance(): LogBridge {
        if (!LogBridge.instance) {
            LogBridge.instance = new LogBridge();
        }
        return LogBridge.instance;
    }

    public getConfig() {
        return Config;
    }

    private setupCommandHandlers() {
        // 注册命令处理器
        this.commandHandlers.set('QUERY_LOGS', this.handleQueryLogs.bind(this));
        this.commandHandlers.set('CLEAR_LOGS', this.handleClearLogs.bind(this));
        this.commandHandlers.set('ping', this.handlePing.bind(this));
        
        // 添加场景相关命令
        this.commandHandlers.set('OPEN_SCENE', this.handleOpenScene.bind(this));
    }

    private startTcpServer() {
        this.server = net.createServer((socket) => {
            console.log('Client connected to Cocos MCP bridge');

            socket.on('data', async (data) => {
                try {
                    // 处理可能的ping命令（简单字符串，不是JSON）
                    const message = data.toString().trim();
                    if (message === 'ping') {
                        const response: CommandResponse = {
                            status: 'success',
                            result: { message: 'pong' }
                        };
                        socket.write(JSON.stringify(response));
                        return;
                    }

                    // 处理JSON命令
                    const command: Command = JSON.parse(message);
                    const response = await this.executeCommand(command);
                    socket.write(JSON.stringify(response));
                } catch (error: any) {
                    const errorResponse: CommandResponse = {
                        status: 'error',
                        error: `Error processing command: ${error.message}`
                    };
                    socket.write(JSON.stringify(errorResponse));
                }
            });

            socket.on('close', () => {
                console.log('Client disconnected from Cocos MCP bridge');
            });

            socket.on('error', (err) => {
                console.error('Socket error:', err);
            });
        });

        this.server.listen(Config.TCP_PORT, Config.TCP_HOST, () => {
            console.log(`Cocos MCP TCP bridge running on ${Config.TCP_HOST}:${Config.TCP_PORT}`);
            this.isRunning = true;
        });

        this.server.on('error', (err) => {
            console.error('TCP Server error:', err);
            this.isRunning = false;
        });
    }

    private setupLogListener() {
        // 监听编辑器日志消息，但不再广播，由客户端查询获取
        Editor.Message.addBroadcastListener('console:log', (log: LogEntry) => {
            // 只记录日志，不再广播
            console.debug('Log captured by Cocos MCP bridge:', log);
        });
    }

    private async executeCommand(command: Command): Promise<CommandResponse> {
        try {
            const { type, params = {} } = command;
            
            const handler = this.commandHandlers.get(type);
            if (!handler) {
                return {
                    status: 'error',
                    error: `Unknown command type: ${type}`
                };
            }

            const result = await handler(params);
            return {
                status: 'success',
                result
            };
        } catch (error: any) {
            console.error(`Error executing command: ${error.message}`);
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    private async handleQueryLogs(params: any): Promise<any> {
        try {
            const showLogs = params.show_logs !== false;
            const showWarnings = params.show_warnings !== false;
            const showErrors = params.show_errors !== false;
            const searchTerm = params.search_term || '';
            const moduleFilter = params.module_filter || '';

            // 直接使用 Editor.Logger.query() API 获取日志列表
            console.log('Querying logs with Editor.Logger.query()...');
            // @ts-ignore - Editor.Logger 是 Cocos Creator 编辑器 API
            const logs = await Editor.Logger.query() || [];
            console.log(`Found ${logs.length} logs`);

            // 根据类型过滤
            let filteredLogs = logs.filter((log: LogEntry) => {
                const type = log.type.toLowerCase();
                return (
                    (showLogs && type === 'log') ||
                    (showWarnings && type === 'warn') ||
                    (showErrors && type === 'error')
                );
            });

            // 根据模块过滤
            if (moduleFilter) {
                console.log(`Filtering logs by module: "${moduleFilter}"`);
                const modulePattern = `[${moduleFilter}]`;
                filteredLogs = filteredLogs.filter((log: LogEntry) => {
                    return log.message.includes(modulePattern);
                });
                console.log(`Found ${filteredLogs.length} logs matching module filter`);
            }

            // 根据搜索词过滤
            if (searchTerm) {
                console.log(`Filtering logs by search term: "${searchTerm}"`);
                const terms = searchTerm.toLowerCase().split(' ');
                const searchResults = filteredLogs.filter((log: LogEntry) => {
                    const content = log.message.toLowerCase();
                    return terms.every((term: string) => content.includes(term));
                });
                console.log(`Found ${searchResults.length} logs matching search term`);
                return {
                    logs: searchResults
                };
            }

            return {
                logs: filteredLogs
            };
        } catch (error: any) {
            console.error('Error querying logs:', error);
            console.error('Error details:', error.message, error.stack);
            throw error;
        }
    }

    private async handleClearLogs(params: any): Promise<any> {
        try {
            console.log('Clearing logs with Editor.Logger.clear()...');
            // @ts-ignore - Editor.Logger 是 Cocos Creator 编辑器 API
            await Editor.Logger.clear();
            
            return {
                message: 'Console logs cleared successfully'
            };
        } catch (error: any) {
            console.error('Error clearing logs:', error);
            throw error;
        }
    }

    private async handlePing(params: any): Promise<any> {
        return { message: 'pong' };
    }

    private async handleOpenScene(params: any): Promise<any> {
        try {
            const { handleOpenScene } = await import('./Commands/SceneCommands');
            return await handleOpenScene(params);
        } catch (error: any) {
            console.error(`Error handling open scene command: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }

    public destroy() {
        if (this.server && this.isRunning) {
            this.server.close();
            this.isRunning = false;
        }
    }
} 