from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from ..cocos_connection import get_cocos_connection
import asyncio
import logging
from config.config import config

logger = logging.getLogger("EditorTools")

@dataclass
class Context:
    """Context for MCP tools."""
    pass

class FastMCP:
    """Fast MCP implementation for Cocos Creator editor control."""
    
    def __init__(self):
        self._tools: Dict[str, Any] = {}
        self._ws = None
        
    async def connect_ws(self):
        """Connect to the Cocos Creator WebSocket server."""
        if not self._ws:
            import websockets
            self._ws = await websockets.connect(
                f"ws://{config.ws_host}:{config.ws_port}{config.ws_path}"
            )
    
    async def send_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Send a message to the editor and wait for response."""
        try:
            await self.connect_ws()
            import json
            await self._ws.send(json.dumps(message))
            response = await self._ws.recv()
            return json.loads(response)
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            return {'error': str(e)}

    async def get_scene_info(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get current scene information."""
        return await self.send_message({
            'type': 'scene.info'
        })

    async def open_scene(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Open a scene by path."""
        return await self.send_message({
            'type': 'scene.open',
            'params': params
        })

    async def save_scene(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Save current scene."""
        return await self.send_message({
            'type': 'scene.save'
        })

    async def new_scene(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new scene."""
        return await self.send_message({
            'type': 'scene.new',
            'params': params
        })

    async def get_object_info(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Get information about a game object."""
        return await self.send_message({
            'type': 'object.info',
            'params': params
        })

    async def create_object(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new game object."""
        return await self.send_message({
            'type': 'object.create',
            'params': params
        })

    async def modify_object(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Modify an existing game object."""
        return await self.send_message({
            'type': 'object.modify',
            'params': params
        })

    async def delete_object(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Delete a game object."""
        return await self.send_message({
            'type': 'object.delete',
            'params': params
        })

    async def get_asset_list(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get list of assets."""
        return await self.send_message({
            'type': 'asset.list',
            'params': params or {}
        })

    async def import_asset(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Import an asset."""
        return await self.send_message({
            'type': 'asset.import',
            'params': params
        })

    async def create_prefab(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Create a prefab from a game object."""
        return await self.send_message({
            'type': 'prefab.create',
            'params': params
        })

    async def instantiate_prefab(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Instantiate a prefab."""
        return await self.send_message({
            'type': 'prefab.instantiate',
            'params': params
        })

def register_editor_tools(mcp: FastMCP):
    """Register all editor tools with the MCP instance."""
    # The tools are already defined as methods in the FastMCP class
    pass

def register_editor_tools(mcp: FastMCP):
    """Register all editor control tools with the MCP server."""
    
    @mcp.tool()
    def read_console(
        ctx: Context,
        show_logs: bool = True,
        show_warnings: bool = True,
        show_errors: bool = True,
        search_term: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Read log messages from the Cocos Creator Console.
        
        Args:
            ctx: The MCP context
            show_logs: Whether to include regular log messages (default: True)
            show_warnings: Whether to include warning messages (default: True)
            show_errors: Whether to include error messages (default: True)
            search_term: Optional text to filter logs by content. If multiple words are provided,
                       entries must contain all words (not necessarily in order) to be included.
            
        Returns:
            List[Dict[str, Any]]: A list of console log entries
        """
        try:
            # Prepare params
            params = {
                "show_logs": show_logs,
                "show_warnings": show_warnings,
                "show_errors": show_errors
            }
            
            if search_term is not None:
                params["search_term"] = search_term

            # Send command to Cocos Creator
            response = get_cocos_connection().send_command("EDITOR_CONTROL", {
                "command": "READ_CONSOLE",
                "params": params
            })
            
            if "error" in response:
                return [{
                    "type": "Error",
                    "message": f"Failed to read console: {response['error']}",
                    "stackTrace": response.get("stackTrace", "")
                }]
            
            entries = response.get("entries", [])
            total_entries = response.get("total_entries", 0)
            filtered_count = response.get("filtered_count", 0)
            
            # Add summary info
            summary = []
            if total_entries > 0:
                summary.append(f"Total console entries: {total_entries}")
                if filtered_count != total_entries:
                    summary.append(f"Filtered entries: {filtered_count}")
                    if filtered_count == 0:
                        summary.append(f"No entries matched the search term: '{search_term}'")
                else:
                    summary.append("Showing all entries")
            else:
                summary.append("No entries in console")
            
            # Add filter info
            filter_types = []
            if show_logs: filter_types.append("logs")
            if show_warnings: filter_types.append("warnings")
            if show_errors: filter_types.append("errors")
            if filter_types:
                summary.append(f"Showing: {', '.join(filter_types)}")
            
            # Add summary as first entry
            if summary:
                entries.insert(0, {
                    "type": "Info",
                    "message": " | ".join(summary),
                    "stackTrace": ""
                })
            
            return entries if entries else [{
                "type": "Info",
                "message": "No logs found in console",
                "stackTrace": ""
            }]
            
        except Exception as e:
            return [{
                "type": "Error",
                "message": f"Error reading console: {str(e)}",
                "stackTrace": ""
            }] 