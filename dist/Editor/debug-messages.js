"use strict";
// Test debugging editor messages
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugAvailableConsoleMessages = debugAvailableConsoleMessages;
exports.runDebug = runDebug;
/**
 * 用于调试Cocos Creator的编辑器消息
 */
// 查询所有可用的消息
async function debugAvailableConsoleMessages() {
    console.log('Debugging console messages...');
    try {
        // 尝试通过不同的命令名称获取日志
        console.log('Trying "query" message...');
        const result1 = await Editor.Message.request('console', 'query');
        console.log('Result from console->query:', result1);
    }
    catch (e1) {
        console.error('Error with console->query:', e1);
    }
    try {
        console.log('Trying "get-logs" message...');
        const result2 = await Editor.Message.request('console', 'get-logs');
        console.log('Result from console->get-logs:', result2);
    }
    catch (e2) {
        console.error('Error with console->get-logs:', e2);
    }
    try {
        console.log('Trying "get" message...');
        const result3 = await Editor.Message.request('console', 'get');
        console.log('Result from console->get:', result3);
    }
    catch (e3) {
        console.error('Error with console->get:', e3);
    }
    try {
        // 测试清除日志功能，已知这个是可用的
        console.log('Trying "clear" message (known to work)...');
        await Editor.Message.request('console', 'clear');
        console.log('console->clear executed successfully');
    }
    catch (e4) {
        console.error('Error with console->clear:', e4);
    }
    // 列出所有可能的消息名称
    console.log('You should look at the Message Manager panel to find all available console messages.');
    console.log('Go to Developer -> Message Manager and search for "console"');
}
// 导出调试函数，可以在开发人员工具中使用
function runDebug() {
    debugAvailableConsoleMessages().catch(err => {
        console.error('Debug failed:', err);
    });
}
