import logging
from typing import Dict, Any, Optional

class SceneTools:
    """场景操作工具类"""
    
    def __init__(self, cocos_client) -> None:
        """
        初始化场景工具
        
        Args:
            cocos_client: Cocos TCP 客户端实例
        """
        self.cocos_client = cocos_client
        logging.info("SceneTools initialized")
        
    def open_scene(self, scene_uuid: str) -> Dict[str, Any]:
        """
        打开指定UUID的场景
        
        Args:
            scene_uuid: 场景资源的UUID
            
        Returns:
            操作结果
        """
        try:
            logging.info(f"向Cocos Creator发送打开场景命令: {scene_uuid}")
            
            # 发送命令并获取响应 - 使用同步方式
            response = self.cocos_client.send_command("OPEN_SCENE", {"sceneUuid": scene_uuid})
            
            # 记录响应
            logging.info(f"Cocos Creator响应: {response}")
            
            # 返回结果
            return {"success": True, "message": "Scene opened successfully"}
                
        except Exception as e:
            logging.error(f"打开场景错误: {e}", exc_info=True)
            return {"success": False, "error": str(e)} 