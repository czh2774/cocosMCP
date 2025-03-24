export class Config {
    // TCP服务器配置
    public static readonly TCP_HOST = 'localhost';
    public static readonly TCP_PORT = 6400;  // 与Unity MCP使用相同端口

    // Logging settings
    public static readonly LOG_LEVEL: string = 'info';
    public static readonly LOG_FORMAT: string = '[%s] %s';
} 