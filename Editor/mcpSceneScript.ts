import { join } from 'path';

// 临时在当前模块增加编辑器内的模块为搜索路径，为了能够正常 require 到 cc 模块
// @ts-ignore - Editor是全局对象
module.paths.push(join(Editor.App.path, 'node_modules'));

// 导入Cocos Creator引擎模块
// @ts-ignore - cc模块在运行时可用
import { director, Node, Vec3 } from 'cc';

/**
 * 场景脚本加载时触发的函数
 */
export function load() {
    console.log('MCP场景脚本已加载');
}

/**
 * 场景脚本卸载时触发的函数
 */
export function unload() {
    console.log('MCP场景脚本已卸载');
}

/**
 * 场景脚本提供的方法
 */
export const methods = {
    /**
     * 获取当前场景信息
     * @returns 场景基本信息
     */
    getSceneInfo() {
        try {
            const scene = director.getScene();
            if (!scene) {
                return {
                    success: false,
                    message: '当前没有打开的场景'
                };
            }

            // 获取场景中的节点数量
            const nodeCount = countNodes(scene);
            
            return {
                success: true,
                data: {
                    name: scene.name,
                    uuid: scene.uuid,
                    nodeCount: nodeCount,
                }
            };
        } catch (error: any) {
            return {
                success: false,
                message: `获取场景信息失败: ${error.message}`
            };
        }
    },

    /**
     * 在场景中查找指定名称的节点
     * @param nodeName 节点名称
     * @returns 节点信息
     */
    findNodeByName(nodeName: string) {
        try {
            if (!nodeName) {
                return {
                    success: false,
                    message: '节点名称不能为空'
                };
            }

            const scene = director.getScene();
            if (!scene) {
                return {
                    success: false,
                    message: '当前没有打开的场景'
                };
            }

            const node = scene.getChildByName(nodeName);
            if (!node) {
                return {
                    success: false,
                    message: `找不到名为 '${nodeName}' 的节点`
                };
            }

            return {
                success: true,
                data: {
                    name: node.name,
                    uuid: node.uuid,
                    position: {
                        x: node.position.x,
                        y: node.position.y,
                        z: node.position.z
                    }
                }
            };
        } catch (error: any) {
            return {
                success: false,
                message: `查找节点失败: ${error.message}`
            };
        }
    },

    /**
     * 列出场景中的所有节点
     * @returns 节点列表
     */
    listSceneNodes() {
        try {
            const scene = director.getScene();
            if (!scene) {
                return {
                    success: false,
                    message: '当前没有打开的场景'
                };
            }

            const nodes = collectNodes(scene);
            
            return {
                success: true,
                data: {
                    nodeCount: nodes.length,
                    nodes: nodes
                }
            };
        } catch (error: any) {
            return {
                success: false,
                message: `列出场景节点失败: ${error.message}`
            };
        }
    }
};

/**
 * 计算场景中的节点数量
 * @param node 起始节点
 * @returns 节点总数
 */
function countNodes(node: Node): number {
    let count = 1; // 当前节点
    
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        count += countNodes(children[i]);
    }
    
    return count;
}

/**
 * 收集场景中的所有节点信息
 * @param node 起始节点
 * @param path 当前节点路径
 * @returns 节点信息列表
 */
function collectNodes(node: Node, path: string = ''): Array<any> {
    const nodePath = path ? `${path}/${node.name}` : node.name;
    const result = [{
        name: node.name,
        uuid: node.uuid,
        path: nodePath,
        childCount: node.children.length,
        active: node.active
    }];
    
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
        result.push(...collectNodes(children[i], nodePath));
    }
    
    return result;
} 