"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogBridge = void 0;
const net = __importStar(require("net"));
const Config_1 = require("./config/Config");
class LogBridge {
    constructor() {
        this.isRunning = false;
        this.commandHandlers = new Map();
        this.setupCommandHandlers();
        this.startTcpServer();
        this.setupLogListener();
    }
    static getInstance() {
        if (!LogBridge.instance) {
            LogBridge.instance = new LogBridge();
        }
        return LogBridge.instance;
    }
    getConfig() {
        return Config_1.Config;
    }
    setupCommandHandlers() {
        // 注册命令处理器
        this.commandHandlers.set('QUERY_LOGS', this.handleQueryLogs.bind(this));
        this.commandHandlers.set('CLEAR_LOGS', this.handleClearLogs.bind(this));
        this.commandHandlers.set('ping', this.handlePing.bind(this));
    }
    startTcpServer() {
        this.server = net.createServer((socket) => {
            console.log('Client connected to Cocos MCP bridge');
            socket.on('data', async (data) => {
                try {
                    // 处理可能的ping命令（简单字符串，不是JSON）
                    const message = data.toString().trim();
                    if (message === 'ping') {
                        const response = {
                            status: 'success',
                            result: { message: 'pong' }
                        };
                        socket.write(JSON.stringify(response));
                        return;
                    }
                    // 处理JSON命令
                    const command = JSON.parse(message);
                    const response = await this.executeCommand(command);
                    socket.write(JSON.stringify(response));
                }
                catch (error) {
                    const errorResponse = {
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
        this.server.listen(Config_1.Config.TCP_PORT, Config_1.Config.TCP_HOST, () => {
            console.log(`Cocos MCP TCP bridge running on ${Config_1.Config.TCP_HOST}:${Config_1.Config.TCP_PORT}`);
            this.isRunning = true;
        });
        this.server.on('error', (err) => {
            console.error('TCP Server error:', err);
            this.isRunning = false;
        });
    }
    setupLogListener() {
        // 监听编辑器日志消息，但不再广播，由客户端查询获取
        Editor.Message.addBroadcastListener('console:log', (log) => {
            // 只记录日志，不再广播
            console.debug('Log captured by Cocos MCP bridge:', log);
        });
    }
    async executeCommand(command) {
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
        }
        catch (error) {
            console.error(`Error executing command: ${error.message}`);
            return {
                status: 'error',
                error: error.message
            };
        }
    }
    async handleQueryLogs(params) {
        try {
            const showLogs = params.show_logs !== false;
            const showWarnings = params.show_warnings !== false;
            const showErrors = params.show_errors !== false;
            const searchTerm = params.search_term || '';
            // 直接使用 Editor.Logger.query() API 获取日志列表
            console.log('Querying logs with Editor.Logger.query()...');
            // @ts-ignore - Editor.Logger 是 Cocos Creator 编辑器 API
            const logs = await Editor.Logger.query() || [];
            console.log(`Found ${logs.length} logs`);
            // 根据类型过滤
            const filteredLogs = logs.filter((log) => {
                const type = log.type.toLowerCase();
                return ((showLogs && type === 'log') ||
                    (showWarnings && type === 'warn') ||
                    (showErrors && type === 'error'));
            });
            // 根据搜索词过滤
            if (searchTerm) {
                const terms = searchTerm.toLowerCase().split(' ');
                return {
                    logs: filteredLogs.filter((log) => {
                        const content = log.message.toLowerCase();
                        return terms.every((term) => content.includes(term));
                    })
                };
            }
            return {
                logs: filteredLogs
            };
        }
        catch (error) {
            console.error('Error querying logs:', error);
            console.error('Error details:', error.message, error.stack);
            throw error;
        }
    }
    async handleClearLogs(params) {
        try {
            console.log('Clearing logs with Editor.Logger.clear()...');
            // @ts-ignore - Editor.Logger 是 Cocos Creator 编辑器 API
            await Editor.Logger.clear();
            return {
                message: 'Console logs cleared successfully'
            };
        }
        catch (error) {
            console.error('Error clearing logs:', error);
            throw error;
        }
    }
    async handlePing(params) {
        return { message: 'pong' };
    }
    destroy() {
        if (this.server && this.isRunning) {
            this.server.close();
            this.isRunning = false;
        }
    }
}
exports.LogBridge = LogBridge;
