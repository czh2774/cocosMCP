from dataclasses import dataclass

@dataclass
class Config:
    # Server settings
    cocos_host: str = "127.0.0.1"
    mcp_port: int = 8765
    
    # Logging settings
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Editor settings
    editor_timeout: float = 5.0  # Timeout for editor operations in seconds
    max_retries: int = 3        # Maximum number of retries for editor operations
    
    # WebSocket settings
    ws_host: str = "127.0.0.1"
    ws_port: int = 8766
    ws_path: str = "/ws"
    
    # File paths
    log_file: str = "cocos_mcp.log"
    
    # Debug settings
    debug_mode: bool = False
    verbose_logging: bool = False

# Global config instance
config = Config() 