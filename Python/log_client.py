import asyncio
import websockets
import json
from typing import Dict, Any, Optional, List, Callable

class LogClient:
    def __init__(self, uri=None, host='127.0.0.1', port=8765):
        if uri:
            self.uri = uri
        else:
            self.uri = f'ws://{host}:{port}/logs'
        self.ws = None
        self.log_callback = None
        self.connected = False

    async def connect(self):
        """连接到日志服务器"""
        try:
            self.ws = await websockets.connect(self.uri)
            self.connected = True
            print(f"Successfully connected to {self.uri}")
            # 启动日志监听
            asyncio.create_task(self._listen_logs())
            return True
        except Exception as e:
            print(f"Failed to connect to log server: {e}")
            self.connected = False
            return False

    async def _listen_logs(self):
        """监听日志消息"""
        if not self.ws:
            return
            
        while True:
            try:
                message = await self.ws.recv()
                data = json.loads(message)
                if data.get('type') == 'log' and self.log_callback:
                    await self.log_callback(data['data'])
            except websockets.exceptions.ConnectionClosed:
                print("WebSocket connection closed")
                self.connected = False
                break
            except Exception as e:
                print(f"Error listening to logs: {e}")
                break

    async def query_logs(self, show_logs: bool = True, show_warnings: bool = True,
                        show_errors: bool = True, search_term: Optional[str] = None) -> Dict[str, Any]:
        """查询日志"""
        if not self.ws or not self.connected:
            return {"error": "Not connected to log server"}
            
        try:
            message = {
                'type': 'query-logs',
                'params': {
                    'showLogs': show_logs,
                    'showWarnings': show_warnings,
                    'showErrors': show_errors,
                    'searchTerm': search_term
                }
            }
            await self.ws.send(json.dumps(message))
            response = await self.ws.recv()
            return json.loads(response)
        except Exception as e:
            print(f"Error querying logs: {e}")
            return {"error": str(e)}

    async def clear_logs(self) -> Dict[str, Any]:
        """清除日志"""
        if not self.ws or not self.connected:
            return {"error": "Not connected to log server"}
            
        try:
            message = {
                'type': 'clear-logs'
            }
            await self.ws.send(json.dumps(message))
            response = await self.ws.recv()
            return json.loads(response)
        except Exception as e:
            print(f"Error clearing logs: {e}")
            return {"error": str(e)}

    def on_log(self, callback: Callable[[Dict[str, Any]], None]):
        """设置日志回调函数"""
        self.log_callback = callback

    async def close(self):
        """关闭连接"""
        if self.ws:
            try:
                await self.ws.close()
                self.connected = False
                print("Connection to log server closed")
            except Exception as e:
                print(f"Error closing connection: {e}")

async def main():
    # 示例用法
    client = LogClient()
    if await client.connect():
        # 设置日志回调
        async def log_callback(log_data):
            print(f"Received log: {log_data}")
        
        client.on_log(log_callback)

        # 查询日志示例
        logs = await client.query_logs(search_term="error")
        print(f"Query result: {logs}")

        # 清除日志示例
        result = await client.clear_logs()
        print(f"Clear result: {result}")

        # 保持连接一段时间以接收实时日志
        await asyncio.sleep(60)
        await client.close()
    else:
        print("Failed to connect to log server")

if __name__ == "__main__":
    asyncio.run(main()) 