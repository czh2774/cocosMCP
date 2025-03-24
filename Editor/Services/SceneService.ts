/**
 * 场景操作服务
 * 封装对场景的操作，使用 Editor.Message 发送场景消息
 */
export class SceneService {
    private static instance: SceneService;

    private constructor() {}

    /**
     * 获取 SceneService 单例
     * @returns SceneService 实例
     */
    public static getInstance(): SceneService {
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
    public async openScene(sceneUuid: string): Promise<boolean> {
        try {
            console.log(`Opening scene with UUID: ${sceneUuid}`);
            await Editor.Message.request('scene', 'open-scene', sceneUuid);
            console.log('Scene opened successfully');
            return true;
        } catch (error: any) {
            console.error('Error opening scene:', error);
            return false;
        }
    }
} 