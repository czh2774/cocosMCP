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
    
    # 1. 打开场景工具
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
    
    # 2. 获取场景信息工具
    def get_scene_info(ctx: Context) -> Dict[str, Any]:
        """
        获取当前场景信息
        
        Returns:
            场景信息
        """
        logging.info("MCP处理get_scene_info请求")
        
        try:
            # 调用SceneTools的方法
            result = scene_tools.get_scene_info()
            return result
        except Exception as e:
            logging.error(f"get_scene_info错误: {e}", exc_info=True)
            return {"success": False, "error": str(e)}
    
    # 4. 列出场景节点工具
    def list_scene_nodes(ctx: Context) -> Dict[str, Any]:
        """
        列出场景中的所有节点
        
        Returns:
            节点列表
        """
        logging.info("MCP处理list_scene_nodes请求")
        
        try:
            # 调用SceneTools的方法
            result = scene_tools.list_scene_nodes()
            return result
        except Exception as e:
            logging.error(f"list_scene_nodes错误: {e}", exc_info=True)
            return {"success": False, "error": str(e)}
    
    # 注册工具
    mcp.tool(name="open_scene")(open_scene)
    mcp.tool(name="get_scene_info")(get_scene_info)
    mcp.tool(name="list_scene_nodes")(list_scene_nodes) 