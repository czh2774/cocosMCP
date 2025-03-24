"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.load = exports.methods = void 0;
const LogBridge_1 = require("./LogBridge");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
exports.methods = {
    openLogBridge() {
        try {
            console.log('Opening Log Bridge...');
            // 获取实例并确保 TCP 服务器正在运行
            const bridge = LogBridge_1.LogBridge.getInstance();
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
        }
        catch (error) {
            console.error('Error opening Log Bridge:', error);
        }
    },
    /**
     * 获取当前场景信息
     * 通过调用场景脚本的getSceneInfo方法
     * @returns 场景信息
     */
    async getSceneInfo() {
        try {
            // 调用场景脚本的方法
            const result = await Editor.Message.request('scene', 'execute-scene-script', {
                name: 'cocos-mcp',
                method: 'getSceneInfo',
                args: []
            });
            return result;
        }
        catch (error) {
            console.error('Error getting scene info:', error);
            return {
                success: false,
                message: `获取场景信息失败: ${error.message || error}`
            };
        }
    },
    /**
     * 列出场景中的所有节点
     * @returns 节点列表
     */
    async listSceneNodes() {
        try {
            // 调用场景脚本的方法
            const result = await Editor.Message.request('scene', 'execute-scene-script', {
                name: 'cocos-mcp',
                method: 'listSceneNodes',
                args: []
            });
            return result;
        }
        catch (error) {
            console.error('Error listing scene nodes:', error);
            return {
                success: false,
                message: `列出场景节点失败: ${error.message || error}`
            };
        }
    }
};
/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
const load = function () {
    console.log('Loading Cocos MCP TCP Bridge...');
    LogBridge_1.LogBridge.getInstance();
    console.log('Cocos MCP TCP Bridge loaded successfully');
};
exports.load = load;
/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
const unload = function () {
    console.log('Unloading Cocos MCP TCP Bridge...');
    LogBridge_1.LogBridge.getInstance().destroy();
    console.log('Cocos MCP TCP Bridge unloaded successfully');
};
exports.unload = unload;
