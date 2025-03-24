"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
}
exports.Config = Config;
// TCP服务器配置
Config.TCP_HOST = 'localhost';
Config.TCP_PORT = 6400; // 与Unity MCP使用相同端口
// Logging settings
Config.LOG_LEVEL = 'info';
Config.LOG_FORMAT = '[%s] %s';
