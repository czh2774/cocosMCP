from mcp.server.fastmcp import FastMCP, Context, Image
import logging
from dataclasses import dataclass
from contextlib import asynccontextmanager
from typing import AsyncIterator, Dict, Any, List
from config import config
from tools import register_all_tools
from cocos_connection import get_cocos_connection

# Configure logging using settings from config
logging.basicConfig(
    level=getattr(logging, config.log_level),
    format=config.log_format,
    filename=config.log_file,
    filemode='a'
)
logger = logging.getLogger("CocosMCP")

@asynccontextmanager
async def server_lifespan(server: FastMCP) -> AsyncIterator[Dict[str, Any]]:
    """Handle server startup and shutdown."""
    logger.info("CocosMCP server starting up")
    try:
        # 尝试连接到Cocos Creator
        cocos_connection = get_cocos_connection()
        try:
            # 验证连接是否有效
            cocos_connection.send_command("ping")
            logger.info("Connected to Cocos Creator on startup")
        except Exception as e:
            logger.warning(f"Could not verify Cocos Creator connection: {str(e)}")
    except Exception as e:
        logger.warning(f"Could not connect to Cocos Creator on startup: {str(e)}")
    
    try:
        yield {}
    finally:
        # 获取连接并断开
        try:
            cocos_connection = get_cocos_connection()
            cocos_connection.disconnect()
        except:
            pass
        logger.info("CocosMCP server shut down")

# Initialize MCP server
mcp = FastMCP(
    "CocosMCP",
    description="Cocos Creator integration via Model Context Protocol",
    lifespan=server_lifespan
)

# Add prompt to explain tool usage
@mcp.prompt()
def log_management_guide() -> str:
    """Guide for managing Cocos Creator logs."""
    return (
        "Cocos Creator MCP Tools Guide:\n\n"
        "1. **Querying Logs**\n"
        "   - `query_logs(show_logs=True, show_warnings=True, show_errors=True, search_term=None)` - Read and filter Cocos Creator Console logs\n"
        "2. **Clearing Logs**\n"
        "   - `clear_logs()` - Clear all console logs\n"
        "3. **Checking Connection**\n"
        "   - `connection_status()` - Check if connected to Cocos Creator\n\n"
        "4. **Best Practices**\n"
        "   - Always check connection status before performing operations\n"
        "   - Use search terms to filter console output when debugging\n"
        "   - Clear logs before major operations to make debugging easier\n"
        "   - Filter by log types when looking for specific issues\n"
    )

# Register all tools
register_all_tools(mcp)

# Run the server
if __name__ == "__main__":
    logger.info("Starting CocosMCP server")
    # Use stdio transport for Cursor integration
    mcp.run(transport='stdio') 