from .log_tools import register_log_tools
from cocos_connection import get_cocos_connection
from mcp.server.fastmcp import Context
from typing import Dict, Any, Optional
import logging

# 尝试导入 scene_tools，如果不存在则跳过
try:
    from .scene_tools import SceneTools
    HAS_SCENE_TOOLS = True
except ImportError:
    HAS_SCENE_TOOLS = False

def register_all_tools(mcp):
    """Register all tools with the MCP server."""
    register_log_tools(mcp)
    
    # 如果场景工具可用则注册
    if HAS_SCENE_TOOLS:
        register_scene_tools(mcp)
    
def register_scene_tools(mcp):
    """Register scene tools with the MCP server."""
    if not HAS_SCENE_TOOLS:
        return
    
    # 创建一个SceneTools实例
    cocos_client = get_cocos_connection()
    scene_tools = SceneTools(cocos_client)
    
    # 使用普通函数包装对SceneTools的调用
    def open_scene(ctx: Context, scene_uuid: str) -> Dict[str, Any]:
        """
        打开指定UUID的场景
        
        Args:
            scene_uuid: 场景资源的UUID
            
        Returns:
            操作结果
        """
        logging.info(f"MCP处理open_scene请求: {scene_uuid}")
        
        if not scene_uuid:
            return {"success": False, "error": "Missing scene_uuid parameter"}
            
        try:
            # 直接调用SceneTools的方法并返回结果
            result = scene_tools.open_scene(scene_uuid)
            return result
        except Exception as e:
            logging.error(f"open_scene错误: {e}", exc_info=True)
            return {"success": False, "error": str(e)}
    
    # 注册工具，仅保留open_scene
    mcp.tool(name="open_scene")(open_scene) 