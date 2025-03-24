import socket
import json
import logging
from dataclasses import dataclass
from typing import Dict, Any, Optional
from config import config

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.log_level),
    format=config.log_format,
    filename=config.log_file,
    filemode='a'
)
logger = logging.getLogger("CocosMCP")

@dataclass
class CocosConnection:
    """Manages the socket connection to the Cocos Creator Editor."""
    host: str = config.cocos_host
    port: int = config.cocos_port
    sock: Optional[socket.socket] = None

    def connect(self) -> bool:
        """Establish a connection to the Cocos Creator Editor."""
        if self.sock:
            return True
        try:
            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.connect((self.host, self.port))
            logger.info(f"Connected to Cocos Creator at {self.host}:{self.port}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Cocos Creator: {str(e)}")
            self.sock = None
            return False

    def disconnect(self):
        """Close the connection to the Cocos Creator Editor."""
        if self.sock:
            try:
                self.sock.close()
            except Exception as e:
                logger.error(f"Error disconnecting from Cocos Creator: {str(e)}")
            finally:
                self.sock = None

    def receive_full_response(self, sock, buffer_size=config.buffer_size) -> bytes:
        """Receive a complete response from Cocos Creator, handling chunked data."""
        chunks = []
        sock.settimeout(config.connection_timeout)  # Use timeout from config
        try:
            while True:
                chunk = sock.recv(buffer_size)
                if not chunk:
                    if not chunks:
                        raise Exception("Connection closed before receiving data")
                    break
                chunks.append(chunk)
                
                # Process the data received so far
                data = b''.join(chunks)
                decoded_data = data.decode('utf-8')
                
                # Check if we've received a complete response
                try:
                    # Special case for ping-pong
                    if decoded_data.strip().startswith('{"status":"success","result":{"message":"pong"'):
                        logger.debug("Received ping response")
                        return data
                    
                    # Validate JSON format
                    json.loads(decoded_data)
                    
                    # If we get here, we have valid JSON
                    logger.info(f"Received complete response ({len(data)} bytes)")
                    return data
                except json.JSONDecodeError:
                    # We haven't received a complete valid JSON response yet
                    continue
                except Exception as e:
                    logger.warning(f"Error processing response chunk: {str(e)}")
                    # Continue reading more chunks as this might not be the complete response
                    continue
        except socket.timeout:
            logger.warning("Socket timeout during receive")
            raise Exception("Timeout receiving Cocos Creator response")
        except Exception as e:
            logger.error(f"Error during receive: {str(e)}")
            raise

    def send_command(self, command_type: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """发送命令到 Cocos Creator 并返回响应(同步版本)."""
        if not self.sock and not self.connect():
            raise ConnectionError("Not connected to Cocos Creator")
        
        # Special handling for ping command
        if command_type == "ping":
            try:
                logger.debug("Sending ping to verify connection")
                self.sock.sendall(b"ping")
                response_data = self.receive_full_response(self.sock)
                response = json.loads(response_data.decode('utf-8'))
                
                if response.get("status") != "success":
                    logger.warning("Ping response was not successful")
                    self.sock = None
                    raise ConnectionError("Connection verification failed")
                    
                return {"message": "pong"}
            except Exception as e:
                logger.error(f"Ping error: {str(e)}")
                self.sock = None
                raise ConnectionError(f"Connection verification failed: {str(e)}")
        
        # Normal command handling
        command = {"type": command_type, "params": params or {}}
        try:
            logger.info(f"Sending command: {command_type} with params: {params}")
            self.sock.sendall(json.dumps(command).encode('utf-8'))
            response_data = self.receive_full_response(self.sock)
            response = json.loads(response_data.decode('utf-8'))
            
            if response.get("status") == "error":
                error_message = response.get("error") or response.get("message", "Unknown Cocos Creator error")
                logger.error(f"Cocos Creator error: {error_message}")
                raise Exception(error_message)
            
            result = response.get("result", {})
            logger.debug(f"Command result: {result}")
            return result
        except Exception as e:
            logger.error(f"Communication error with Cocos Creator: {str(e)}")
            self.sock = None
            raise Exception(f"Failed to communicate with Cocos Creator: {str(e)}")
            
    async def send_command_async(self, command_type: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """发送命令到 Cocos Creator 并返回响应(异步版本)."""
        # 这里我们直接调用同步版本，因为异步处理的问题较多
        # 在实际应用中，如果需要真正的异步，应该使用异步IO库
        return self.send_command(command_type, params)

# Global connection instance
_connection: Optional[CocosConnection] = None

def get_cocos_connection() -> CocosConnection:
    """Get the global Cocos Creator connection instance."""
    global _connection
    if _connection is None:
        _connection = CocosConnection()
        if not _connection.connect():
            logger.error("Failed to establish initial connection to Cocos Creator")
    
    return _connection 