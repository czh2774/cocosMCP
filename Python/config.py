"""
Configuration settings for the Cocos MCP Server.
This file contains all configurable parameters for the server.
"""

from dataclasses import dataclass

@dataclass
class ServerConfig:
    """Main configuration class for the MCP server."""
    
    # Cocos Creator connection settings
    cocos_host: str = "localhost"
    cocos_port: int = 6400
    
    # Connection settings
    connection_timeout: float = 30.0  # 30 seconds timeout
    buffer_size: int = 8192  # 8KB buffer size
    
    # Logging settings
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_file: str = "cocos_mcp.log"
    
    # Server settings
    max_retries: int = 3
    retry_delay: float = 1.0

# Create a global config instance
config = ServerConfig() 