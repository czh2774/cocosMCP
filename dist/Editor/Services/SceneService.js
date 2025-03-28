"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneService = void 0;
/**
 * 场景操作服务
 * 封装对场景的操作，使用 Editor.Message 发送场景消息
 */
class SceneService {
    constructor() { }
    /**
     * 获取 SceneService 单例
     * @returns SceneService 实例
     */
    static getInstance() {
        if (!SceneService.instance) {
            SceneService.instance = new SceneService();
        }
        return SceneService.instance;
    }
    /**
     * 打开场景
     * @param sceneUuid 场景资源的 uuid
     * @returns 是否成功打开场景
     */
    async openScene(sceneUuid) {
        try {
            console.log(`Opening scene with UUID: ${sceneUuid}`);
            await Editor.Message.request('scene', 'open-scene', sceneUuid);
            console.log('Scene opened successfully');
            return true;
        }
        catch (error) {
            console.error('Error opening scene:', error);
            return false;
        }
    }
}
exports.SceneService = SceneService;
