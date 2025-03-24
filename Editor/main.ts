import { LogBridge } from './LogBridge';

/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openLogBridge() {
        try {
            console.log('Opening Log Bridge...');
            
            // 获取实例并确保 TCP 服务器正在运行
            const bridge = LogBridge.getInstance();
            if (!bridge) {
                console.error('Failed to get LogBridge instance');
                return;
            }

            console.log('Log Bridge is running on:');
            console.log(`TCP Server: ${bridge.getConfig().TCP_HOST}:${bridge.getConfig().TCP_PORT}`);
            
            // 输出测试日志
            console.log('Test log message from Cocos MCP');
            console.warn('Test warning message from Cocos MCP');
            console.error('Test error message from Cocos MCP');
            
            console.log('Log Bridge opened successfully');
        } catch (error: any) {
            console.error('Error opening Log Bridge:', error);
        }
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function() {
    console.log('Loading Cocos MCP TCP Bridge...');
    LogBridge.getInstance();
    console.log('Cocos MCP TCP Bridge loaded successfully');
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function() {
    console.log('Unloading Cocos MCP TCP Bridge...');
    LogBridge.getInstance().destroy();
    console.log('Cocos MCP TCP Bridge unloaded successfully');
}; 