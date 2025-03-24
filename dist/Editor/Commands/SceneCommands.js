"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOpenScene = void 0;
const SceneService_1 = require("../Services/SceneService");
/**
 * 打开场景命令处理函数
 * @param params 包含 sceneUuid 的参数对象
 * @returns 操作结果
 */
async function handleOpenScene(params) {
    const { sceneUuid } = params;
    if (!sceneUuid) {
        return {
            success: false,
            error: 'Missing sceneUuid parameter'
        };
    }
    try {
        const sceneService = SceneService_1.SceneService.getInstance();
        const success = await sceneService.openScene(sceneUuid);
        return {
            success,
            message: success ? 'Scene opened successfully' : 'Failed to open scene'
        };
    }
    catch (error) {
        console.error('Error in handleOpenScene:', error);
        return {
            success: false,
            error: error.message || 'Unknown error occurred'
        };
    }
}
exports.handleOpenScene = handleOpenScene;
