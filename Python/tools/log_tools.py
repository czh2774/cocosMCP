import logging
from typing import Dict, Any, Optional, List
from mcp.server.fastmcp import Context
from cocos_connection import get_cocos_connection

# Get the logger
logger = logging.getLogger("CocosMCP")

async def query_logs(
    ctx: Context,
    show_logs: bool = True,
    show_warnings: bool = True,
    show_errors: bool = True,
    search_term: Optional[str] = None,
    module_filter: Optional[str] = None
) -> Dict[str, Any]:
    """
    Query Cocos Creator editor logs with optional filtering.
    
    Args:
        show_logs: Include regular logs in results
        show_warnings: Include warning logs in results
        show_errors: Include error logs in results
        search_term: Optional search term to filter logs
        module_filter: Optional module name to filter logs (e.g. "Scene", "Assets")
    
    Returns:
        Dictionary containing filtered logs
    """
    try:
        cocos = get_cocos_connection()
        # 保存日志请求的副本，因为我们要修改它
        params = {
            "show_logs": show_logs,
            "show_warnings": show_warnings,
            "show_errors": show_errors
        }
        
        # 只有在提供了 search_term 且非空且是字符串类型时才添加
        if search_term and isinstance(search_term, str) and search_term.strip():
            logger.info(f"Adding search term to log query: {search_term}")
            params["search_term"] = search_term.strip()
            
        # 添加模块过滤
        if module_filter and isinstance(module_filter, str) and module_filter.strip():
            logger.info(f"Adding module filter to log query: {module_filter}")
            params["module_filter"] = module_filter.strip()
            
        result = cocos.send_command("QUERY_LOGS", params)
        return result
    except Exception as e:
        logger.error(f"Error querying logs: {e}")
        return {"error": str(e), "logs": []}

async def clear_logs(ctx: Context) -> Dict[str, Any]:
    """
    Clear all Cocos Creator editor logs.
    
    Returns:
        Success status and message
    """
    try:
        cocos = get_cocos_connection()
        result = cocos.send_command("CLEAR_LOGS", {})
        return result
    except Exception as e:
        logger.error(f"Error clearing logs: {e}")
        return {"error": str(e)}

async def connection_status(ctx: Context) -> Dict[str, Any]:
    """
    Check the connection status to Cocos Creator.
    
    Returns:
        Dictionary with connection status information
    """
    try:
        cocos = get_cocos_connection()
        # Try a ping command to verify connection
        cocos.send_command("ping")
        return {
            "connected": True,
            "host": cocos.host,
            "port": cocos.port
        }
    except Exception as e:
        logger.error(f"Connection check failed: {e}")
        return {
            "connected": False,
            "error": str(e)
        }

def log_management_guide() -> str:
    """Guide for managing Cocos Creator logs."""
    return (
        "Cocos Creator MCP Log Tools Guide:\n\n"
        "1. **Querying Logs**\n"
        "   - `query_logs(show_logs=True, show_warnings=True, show_errors=True, search_term=None, module_filter=None)` - Read and filter Cocos Creator Console logs\n"
        "     - Use `module_filter` to filter logs by specific modules (e.g. 'Scene', 'Assets')\n"
        "2. **Clearing Logs**\n"
        "   - `clear_logs()` - Clear all console logs\n"
        "3. **Checking Connection**\n"
        "   - `connection_status()` - Check if connected to Cocos Creator\n\n"
        "4. **Best Practices**\n"
        "   - Always check connection status before performing operations\n"
        "   - Use module filters to focus on specific components (e.g. 'Scene', 'Assets')\n"
        "   - Use search terms to filter console output when debugging\n"
        "   - Clear logs before major operations to make debugging easier\n"
        "   - Filter by log types when looking for specific issues\n"
    )

def register_log_tools(mcp):
    """Register all log tools with the MCP server."""
    mcp.tool()(query_logs)
    mcp.tool()(clear_logs)
    mcp.tool()(connection_status)
    mcp.prompt()(log_management_guide) 