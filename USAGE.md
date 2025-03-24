# Cocos MCP 扩展使用指南

## 简介

Cocos MCP 是一个连接 Cocos Creator 编辑器和 Cursor AI 的桥接工具，允许 Cursor AI 直接与 Cocos Creator 项目交互。本扩展的主要功能包括：

- 日志查询和过滤
- 日志清除
- 场景信息获取和节点查询
- 场景操作（打开场景等）
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

### 场景工具

#### 获取当前场景信息

获取当前打开场景的基本信息，包括名称、UUID和节点数量。

```python
scene_info = await mcp.get_scene_info()
```

示例返回数据：
```json
{
  "success": true,
  "data": {
    "name": "scene-2d",
    "uuid": "2ba0a28b-5be6-420b-b7d3-c7ba097f13fa",
    "nodeCount": 38
  }
}
```

#### 列出场景中的所有节点

获取场景中所有节点的详细信息，包括名称、UUID、路径等。

```python
nodes = await mcp.list_scene_nodes()
```

示例返回数据（部分）：
```json
{
  "success": true,
  "data": {
    "nodeCount": 38,
    "nodes": [
      {
        "name": "scene-2d",
        "uuid": "2ba0a28b-5be6-420b-b7d3-c7ba097f13fa",
        "path": "scene-2d",
        "childCount": 3,
        "active": true
      },
      {
        "name": "Canvas",
        "uuid": "beI88Z2HpFELqR4T5EMHpg",
        "path": "scene-2d/Canvas",
        "childCount": 1,
        "active": true
      },
      // ... 更多节点
    ]
  }
}
```

#### 打开场景

通过UUID打开指定的场景。

```python
result = await mcp.open_scene("2ba0a28b-5be6-420b-b7d3-c7ba097f13fa")
```

示例返回数据：
```json
{
  "success": true,
  "message": "Scene opened successfully"
}
```

## 工作原理

1. Cocos MCP 扩展在 Cocos Creator 中启动一个 TCP 服务器（默认端口：6400）
2. Python MCP 服务器连接到这个 TCP 服务器，并同时启动一个 WebSocket 服务器（默认端口：8765）
3. Cursor AI 通过 WebSocket 与 MCP 服务器通信，间接控制 Cocos Creator

## 技术说明

### 日志查询实现

Cocos MCP 扩展使用 `Editor.Logger.query()` API 获取 Cocos Creator 的日志，然后根据请求的参数进行过滤。由于 Cocos Creator 的 API 限制，所有日志都会先被获取，然后在内存中进行过滤。

### 场景脚本实现

场景工具通过 Cocos Creator 的场景脚本机制实现，主要包括以下步骤：

1. 在扩展的 `package.json` 中注册场景脚本
2. 实现场景脚本，访问场景和节点信息
3. 通过 TCP 通信桥将场景操作暴露给 Cursor AI

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
- `GET_SCENE_INFO`: 获取场景信息
- `LIST_SCENE_NODES`: 列出场景节点
- `OPEN_SCENE`: 打开场景
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

### 场景三：分析场景结构

当你需要了解当前场景的结构和组织方式时：

```python
# 获取场景信息
scene_info = await mcp.get_scene_info()
print(f"当前场景: {scene_info['data']['name']}, 包含 {scene_info['data']['nodeCount']} 个节点")

# 获取所有节点
nodes = await mcp.list_scene_nodes()
# 分析节点层次结构
root_nodes = [node for node in nodes['data']['nodes'] if '/' not in node['path']]
print(f"根节点数量: {len(root_nodes)}")

# 查找特定类型的节点，如相机
cameras = [node for node in nodes['data']['nodes'] if 'Camera' in node['name']]
print(f"找到 {len(cameras)} 个相机节点")
```

### 场景四：快速切换场景

在开发过程中需要频繁切换不同场景进行测试时：

```python
# 存储常用场景的UUID
scenes = {
    "主菜单": "uuid-of-main-menu-scene",
    "战斗": "uuid-of-battle-scene",
    "商店": "uuid-of-shop-scene"
}

# 快速切换到指定场景
await mcp.open_scene(scenes["战斗"])
print("已切换到战斗场景")
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

### 场景结构分析与优化

使用场景节点信息来分析游戏性能瓶颈：

```python
nodes = await mcp.list_scene_nodes()

# 查找子节点数量过多的节点（可能导致性能问题）
complex_nodes = []
for node in nodes['data']['nodes']:
    if node['childCount'] > 20:  # 假设超过20个子节点为复杂节点
        complex_nodes.append(node)

print(f"发现 {len(complex_nodes)} 个复杂节点可能需要优化:")
for node in complex_nodes:
    print(f"  - {node['path']} (子节点数: {node['childCount']})")
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

### 场景操作失败

如果场景相关操作失败：

1. 确认 Cocos Creator 处于编辑模式而非运行模式
2. 检查提供的场景 UUID 是否正确
3. 重新启动 Cocos Creator 和 MCP 服务器

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