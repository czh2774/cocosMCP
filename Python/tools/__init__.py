from .log_tools import register_log_tools

def register_all_tools(mcp):
    """Register all tools with the MCP server."""
    register_log_tools(mcp) 