#!/bin/bash

# 确保我们使用正确的 Python
PYTHON_PATH="/opt/homebrew/bin/python3"

# 检查 mcp 模块是否可用，如果不可用则安装
$PYTHON_PATH -c "import mcp" 2>/dev/null || $PYTHON_PATH -m pip install mcp --break-system-packages

# 设置 PYTHONPATH 以确保可以找到所有模块
cd "$(dirname "$0")"
export PYTHONPATH=$PYTHONPATH:$(pwd)

# 打印一些有用的信息
echo "Starting Cocos MCP server with Python: $PYTHON_PATH"
echo "PYTHONPATH: $PYTHONPATH"
echo "Current directory: $(pwd)"

# 启动服务器
$PYTHON_PATH server.py 