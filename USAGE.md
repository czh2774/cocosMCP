# Cocos MCP 扩展使用指南

## 简介

Cocos MCP 是一个连接 Cocos Creator 编辑器和 Cursor AI 的桥接工具，允许 Cursor AI 直接与 Cocos Creator 项目交互。本扩展的主要功能包括：

- 日志查询和过滤
- 日志清除
- TCP 通信桥接

## 安装

### 前置条件

- Cocos Creator 3.8.0 或更高版本
- Python 3.7 或更高版本（用于 Cursor MCP 服务）
- uv 包管理器（用于管理 Python 依赖）

### 安装步骤

1. **安装扩展到 Cocos Creator**
   
   将 `cocos-mcp` 文件夹复制到 Cocos Creator 项目的 `extensions` 目录下。路径结构应如下：
   ```
   your-cocos-project/
   ├── assets/
   ├── extensions/
   │   └── cocos-mcp/
   │       ├── Editor/
   │       ├── Python/
   │       ├── dist/
   │       └── package.json
   └── ...
   ```

2. **安装 Python 依赖**
   
   ```bash
   cd your-cocos-project/extensions/cocos-mcp/Python
   uv pip install -r requirements.txt
   ```

3. **在 Cocos Creator 中启用扩展**
   
   打开 Cocos Creator，进入 `扩展 -> 扩展管理器`，确保 `cocos-mcp` 扩展已启用。

## 配置 Cursor AI

1. 打开 Cursor AI 设置
2. 进入 MCP 配置页面
3. 添加以下命令来启动 MCP 服务器：
   ```bash
   uv --directory "/path/to/your-cocos-project/extensions/cocos-mcp/Python" run server.py
   ```
   注意：请将路径替换为实际的 cocos-mcp/Python 目录路径

## 功能详解

### 日志查询

日志查询功能允许你从 Cocos Creator 编辑器获取日志信息，并可以按类型过滤。

#### 在 Cursor AI 中查询日志

```python
response = await mcp.query_logs({
    "show_logs": True,      # 是否显示普通日志
    "show_warnings": True,  # 是否显示警告
    "show_errors": True     # 是否显示错误
})
```

#### 使用搜索词过滤日志

```python
response = await mcp.query_logs({
    "show_logs": True,
    "show_warnings": True,
    "show_errors": True,
    "search_term": "error"  # 只显示包含 "error" 的日志
})
```

### 清除日志

```python
response = await mcp.clear_logs()
```

### 检查连接状态

```python
status = await mcp.connection_status()
```

## 工作原理

1. Cocos MCP 扩展在 Cocos Creator 中启动一个 TCP 服务器（默认端口：6400）
2. Python MCP 服务器连接到这个 TCP 服务器，并同时启动一个 WebSocket 服务器（默认端口：8765）
3. Cursor AI 通过 WebSocket 与 MCP 服务器通信，间接控制 Cocos Creator

## 技术说明

### 日志查询实现

Cocos MCP 扩展使用 `Editor.Logger.query()` API 获取 Cocos Creator 的日志，然后根据请求的参数进行过滤。由于 Cocos Creator 的 API 限制，所有日志都会先被获取，然后在内存中进行过滤。

### TCP 通信协议

TCP 通信使用 JSON 格式的消息：

```json
{
  "type": "COMMAND_TYPE",
  "params": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

支持的命令类型：
- `QUERY_LOGS`: 查询日志
- `CLEAR_LOGS`: 清除日志
- `ping`: 连接测试

## 故障排除

### 连接问题

如果 Cursor AI 无法连接到 Cocos Creator：

1. 确认 Cocos Creator 已启动并加载了 cocos-mcp 扩展
2. 检查 TCP 端口（6400）是否被占用
3. 重启 Cocos Creator 编辑器
4. 重新启动 MCP 服务器

### 日志查询返回空结果

如果日志查询返回空结果：

1. 确认 Cocos Creator 编辑器中有日志输出
2. 检查连接状态是否为 `connected: true`
3. 尝试清除日志后再生成新的日志
4. 重新启用 cocos-mcp 扩展

## 已知限制

- 日志过滤在客户端进行，而不是服务器端
- 不支持分页加载大量日志
- 没有持久化存储日志的功能

## 更新日志

### v1.0.0 (2025-03-21)
- 修复了日志查询功能
- 更新了类型定义
- 移除了不必要的调试代码
- 改进了错误处理 