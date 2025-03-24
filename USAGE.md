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

## 应用场景

### 场景一：调试游戏运行时错误

当你的 Cocos Creator 游戏在运行时出现错误时，可以使用 Cursor AI 快速分析问题：

1. 在 Cocos Creator 中运行游戏
2. 出现错误后，在 Cursor AI 中查询错误日志：
   ```python
   errors = await mcp.query_logs({
       "show_logs": False,
       "show_warnings": False,
       "show_errors": True
   })
   print("Found errors:", len(errors.get("logs", [])))
   ```
3. 让 Cursor AI 分析错误原因并提供解决方案

### 场景二：追踪特定模块的日志

当你需要关注游戏中特定模块（例如物理引擎）的日志时：

```python
physics_logs = await mcp.query_logs({
    "show_logs": True,
    "show_warnings": True,
    "show_errors": True,
    "search_term": "physics"
})
```

### 场景三：监控性能相关警告

使用搜索词过滤来监控性能相关的警告：

```python
performance_warnings = await mcp.query_logs({
    "show_logs": False,
    "show_warnings": True,
    "show_errors": False,
    "search_term": "performance"
})
```

### 场景四：调试资源加载问题

查找与资源加载相关的日志：

```python
asset_logs = await mcp.query_logs({
    "show_logs": True,
    "show_warnings": True,
    "show_errors": True,
    "search_term": "assets"
})
```

## 高级用法

### 结合 Cursor AI 分析功能

你可以结合 Cursor AI 的强大分析能力，自动识别和解决问题：

```python
# 获取所有错误日志
errors = await mcp.query_logs({
    "show_logs": False,
    "show_warnings": False,
    "show_errors": True
})

# 让 Cursor AI 分析每个错误并提供解决方案
for log in errors.get("logs", []):
    print(f"分析错误: {log['message']}")
    # Cursor AI 分析代码...
```

### 自动清理日志

在开发过程中定期清理日志，保持日志简洁：

```python
# 每次测试前清理日志
await mcp.clear_logs()
print("日志已清理，开始新的测试...")
```

### 持续监控

设置定期查询，持续监控项目状态：

```python
import time

while True:
    errors = await mcp.query_logs({
        "show_logs": False,
        "show_warnings": False,
        "show_errors": True
    })
    
    if errors.get("logs", []):
        print(f"检测到 {len(errors['logs'])} 个错误!")
        # 处理错误...
    
    time.sleep(5)  # 每 5 秒检查一次
```

## 常见问题

### 日志查询返回空结果

如果日志查询返回空结果：

1. 确认 Cocos Creator 编辑器中有日志输出
2. 检查连接状态是否为 `connected: true`
3. 尝试清除日志后再生成新的日志
4. 重新启用 cocos-mcp 扩展

### 连接问题

如果 Cursor AI 无法连接到 Cocos Creator：

1. 确认 Cocos Creator 已启动并加载了 cocos-mcp 扩展
2. 检查 TCP 端口（6400）是否被占用
3. 重启 Cocos Creator 编辑器
4. 重新启动 MCP 服务器

## 最佳实践

1. **定期清除日志**：长时间运行会积累大量日志，影响查询性能
2. **使用精确的搜索词**：更精确的搜索词可以帮助你更快找到相关日志
3. **按类型过滤**：大多数情况下，错误和警告比普通日志更重要
4. **结合 Cursor AI 分析**：让 Cursor AI 自动分析日志，提供解决方案
5. **自动化工作流**：创建自动化脚本，简化日常开发任务

## 更新日志

### v1.0.0 (2025-03-21)
- 修复了日志查询功能
- 更新了类型定义
- 移除了不必要的调试代码
- 改进了错误处理 