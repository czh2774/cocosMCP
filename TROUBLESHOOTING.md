# Cocos MCP 扩展问题排查指南

本文档列出了使用 Cocos MCP 扩展时可能遇到的常见问题及其解决方案。

## 连接问题

### 问题: Cursor 无法连接到 Cocos Creator

**症状:**
- Cursor 中显示 "Connection verification failed"
- 连接状态显示 `"connected": false`

**解决方案:**
1. 确认 Cocos Creator 是否正在运行，并且已加载 cocos-mcp 扩展
2. 检查 TCP 端口 6400 是否被其他应用占用
   ```bash
   # macOS/Linux
   lsof -i :6400
   
   # Windows
   netstat -ano | findstr :6400
   ```
3. 在 Cocos Creator 中，重新启用 cocos-mcp 扩展
4. 重启 Cocos Creator 和 MCP 服务器

### 问题: 连接断开后无法重连

**症状:**
- 之前连接正常，但现在无法连接
- 连接状态显示 `"error": "Connection closed before receiving data"`

**解决方案:**
1. 在 Cocos Creator 中，禁用后重新启用 cocos-mcp 扩展
2. 重启 Cursor MCP 服务器
3. 如果问题仍然存在，重启 Cocos Creator

## 日志问题

### 问题: 日志查询返回空结果

**症状:**
- 查询日志时返回 `"logs": []`
- 但在 Cocos Creator 控制台中可以看到日志

**解决方案:**
1. 首先检查连接状态是否为 `"connected": true`
2. 尝试清除日志后重新生成一些日志：
   ```python
   await mcp.clear_logs()
   ```
3. 确保日志查询参数正确：
   ```python
   response = await mcp.query_logs({
       "show_logs": True, 
       "show_warnings": True, 
       "show_errors": True
   })
   ```
4. 重启 Cocos Creator 编辑器
5. 确认 Cocos Creator 版本是否兼容（建议 3.8.0+）

### 问题: 日志中包含太多警告

**症状:**
- 日志查询结果中包含大量重复的无关警告

**解决方案:**
使用过滤参数仅查看需要的日志类型：
```python
# 只查看错误
response = await mcp.query_logs({
    "show_logs": False, 
    "show_warnings": False, 
    "show_errors": True
})

# 使用搜索词过滤
response = await mcp.query_logs({
    "show_logs": True, 
    "show_warnings": True, 
    "show_errors": True,
    "search_term": "your_search_term"
})
```

## 安装问题

### 问题: 安装依赖失败

**症状:**
- 安装 Python 依赖时出错
- `uv pip install` 命令失败

**解决方案:**
1. 确保已正确安装 uv：
   ```bash
   # 检查版本
   uv --version
   ```
2. 尝试使用 pip 安装：
   ```bash
   pip install -r requirements.txt
   ```
3. 检查 Python 版本是否兼容（需要 3.7+）：
   ```bash
   python --version
   ```

### 问题: 扩展无法在 Cocos Creator 中加载

**症状:**
- Cocos Creator 扩展管理器中看不到 cocos-mcp 扩展
- 或者扩展显示为禁用状态且无法启用

**解决方案:**
1. 确认扩展路径正确（应在项目的 extensions 目录下）
2. 检查 package.json 格式是否正确
3. 在 Cocos Creator 日志中查找关于扩展加载的错误
4. 尝试手动编译扩展：
   ```bash
   cd /path/to/cocos-mcp
   tsc
   ```

## 功能问题

### 问题: 无法清除日志

**症状:**
- 执行 clear_logs 命令后，日志仍然可见

**解决方案:**
1. 确认连接状态为 `"connected": true`
2. 查看命令是否返回成功：
   ```python
   response = await mcp.clear_logs()
   print(response)  # 应该显示 {"message": "Console logs cleared successfully"}
   ```
3. 在清除后重新查询日志，确认结果
4. 如果问题仍然存在，重启 Cocos Creator

### 问题: 特定版本的 Cocos Creator 不兼容

**症状:**
- 在某些版本的 Cocos Creator 中，扩展无法正常工作

**解决方案:**
1. 确认当前使用的 Cocos Creator 版本：
   ```typescript
   console.log(Editor.App.version);
   ```
2. 查看 cocos-mcp 的支持说明，确认是否支持当前版本
3. 尝试使用 3.8.0+ 版本的 Cocos Creator
4. 如果需要支持特定版本，可能需要修改代码以适应 API 差异

## 性能问题

### 问题: 查询大量日志时性能下降

**症状:**
- 当日志条目非常多时，查询变得缓慢

**解决方案:**
1. 定期清除日志以减少数量
2. 使用更精确的过滤条件：
   ```python
   response = await mcp.query_logs({
       "show_logs": False,  # 不显示普通日志
       "show_warnings": True,
       "show_errors": True,
       "search_term": "specific_error"  # 添加搜索词
   })
   ```
3. 考虑修改代码添加分页功能（参见 DEVELOPMENT.md）

## 如果所有方法都不起作用

如果你尝试了上述所有解决方案但问题仍然存在，可以：

1. 完全删除扩展并重新安装
2. 检查 Cocos Creator 和操作系统的日志
3. 尝试在不同的项目中使用扩展
4. 降级或升级 Cocos Creator 版本

## 提交问题

如果你发现了无法解决的问题或 bug，请提交 issue，并包含以下信息：

1. 详细的问题描述和复现步骤
2. Cocos Creator 版本
3. 操作系统信息
4. 错误消息和日志内容
5. 已经尝试过的解决方案 