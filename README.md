# Cocos MCP Log Bridge

一个简单的日志桥接工具，用于在 Cocos Creator 编辑器和 Cursor 之间同步日志信息。

## 功能特点

- 实时日志同步
- 支持按类型过滤（普通日志、警告、错误）
- 支持关键词搜索
- 支持清除日志
- 兼容 Cursor MCP 协议

## 安装

### 前置条件
- Python 3.7 或更高版本
- uv 包管理器

**Mac 安装 uv：**
```bash
brew install uv
```

**Windows 安装 uv：**
```bash
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
# 然后添加到 PATH：
set Path=%USERPROFILE%\.local\bin;%Path%
```

**Linux 安装 uv：**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 安装步骤

1. 将 `cocos-mcp` 文件夹复制到 Cocos Creator 项目的 `extensions` 目录下
2. 安装 Python 依赖：
   ```bash
   cd cocos-mcp/Python
   uv pip install -r requirements.txt
   ```

## Cursor 集成

1. 打开 Cursor 设置
2. 进入 MCP 配置页面
3. 添加以下命令：
   ```bash
   uv --directory "/path/to/your/cocos-mcp/Python" run server.py
   ```
   注意：将路径替换为实际的 cocos-mcp/Python 目录路径

## 使用方式

### 在 Cursor 中使用

Cursor 会自动连接到日志服务器，你可以：

1. 查询日志：
```python
response = await mcp.query_logs({
    "show_logs": True,
    "show_warnings": True,
    "show_errors": True,
    "search_term": "error"  # 可选
})
```

2. 清除日志：
```python
response = await mcp.clear_logs()
```

所有编辑器日志会自动同步到 Cursor 的输出中。

## 配置

默认配置：
- WebSocket 服务器：`ws://localhost:8765/logs`
- MCP 服务器：`localhost:6500`

## 注意事项

- 确保 Cocos Creator 编辑器已启动并加载了插件
- 一次只运行一个 MCP 服务器实例
- 日志同步是实时的，无需手动刷新
- 使用 uv 包管理器可以确保依赖版本的一致性 