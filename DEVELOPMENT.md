# Cocos MCP 扩展开发指南

本文档面向希望维护、调试或扩展 Cocos MCP 功能的开发者。

## 项目结构

```
cocos-mcp/
├── Editor/                 # Cocos Creator 编辑器扩展代码
│   ├── @types/             # TypeScript 类型定义
│   ├── LogBridge.ts        # 日志桥接核心实现
│   ├── config/             # 配置文件
│   └── main.ts             # 扩展入口点
├── Python/                 # Python MCP 服务器
│   └── server.py           # 服务器实现
├── dist/                   # 编译后的 JavaScript 文件
├── node_modules/           # Node.js 依赖
├── package.json            # 项目配置
└── tsconfig.json           # TypeScript 配置
```

## 开发环境设置

### 编辑器扩展开发

1. **安装 Node.js 依赖**

   ```bash
   cd /path/to/cocos-mcp
   npm install
   ```

2. **编译 TypeScript 代码**

   ```bash
   cd /path/to/cocos-mcp
   tsc
   ```

3. **启用实时编译（可选）**

   ```bash
   cd /path/to/cocos-mcp
   tsc --watch
   ```

### Python 服务器开发

1. **创建虚拟环境（可选但推荐）**

   ```bash
   cd /path/to/cocos-mcp/Python
   uv venv
   source .venv/bin/activate  # 在 Linux/macOS 上
   # 或在 Windows 上：
   # .venv\Scripts\activate
   ```

2. **安装依赖**

   ```bash
   uv pip install -r requirements.txt
   ```

## 编码规范

### TypeScript

- 使用 2 空格缩进
- 使用 camelCase 命名变量和函数
- 使用 PascalCase 命名类和接口
- 尽可能添加类型注解
- 添加合适的注释，特别是对于公共 API

### Python

- 遵循 PEP 8 规范
- 使用 4 空格缩进
- 使用蛇形命名法（snake_case）命名变量和函数
- 使用类型注解（Python 3.7+）

## 调试技巧

### 调试编辑器扩展

1. **启用 Cocos Creator 开发者工具**
   
   在 Cocos Creator 中，按下 `F12` 或选择 `开发者 -> 开发者工具` 打开 Chrome DevTools。

2. **检查日志输出**
   
   在 DevTools 的 Console 面板中查看日志输出。你也可以添加 `console.debug()` 语句来追踪代码执行。

3. **重新加载扩展**
   
   修改代码后，在 `扩展管理器` 中重新加载扩展，或重启 Cocos Creator。

### 调试 Python 服务器

1. **启用详细日志**
   
   在 `server.py` 中增加日志输出级别：
   
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. **手动测试 TCP 连接**
   
   使用 `telnet` 或其他 TCP 客户端工具测试连接：
   
   ```bash
   telnet localhost 6400
   ```
   
   然后输入：
   ```
   {"type":"ping","params":{}}
   ```
   
   应该收到：
   ```
   {"status":"success","result":{"message":"pong"}}
   ```

## 扩展功能

### 添加新的编辑器命令

1. 在 `LogBridge.ts` 中添加新的命令处理函数：

   ```typescript
   private async handleNewCommand(params: any): Promise<any> {
     try {
       // 实现命令逻辑
       return {
         result: "command executed"
       };
     } catch (error: any) {
       console.error('Error handling command:', error);
       throw error;
     }
   }
   ```

2. 在 `setupCommandHandlers` 方法中注册命令：

   ```typescript
   private setupCommandHandlers() {
     // 现有命令
     this.commandHandlers.set('QUERY_LOGS', this.handleQueryLogs.bind(this));
     this.commandHandlers.set('CLEAR_LOGS', this.handleClearLogs.bind(this));
     // 添加新命令
     this.commandHandlers.set('NEW_COMMAND', this.handleNewCommand.bind(this));
   }
   ```

3. 更新 Python 服务器中的相应功能。

### 改进日志查询

可以通过添加以下功能来改进日志查询：

1. **分页功能**：
   ```typescript
   private async handleQueryLogs(params: any): Promise<any> {
     // 添加分页参数
     const page = params.page || 1;
     const pageSize = params.page_size || 50;
     
     // 获取日志后进行分页
     const allLogs = await Editor.Logger.query() || [];
     const startIdx = (page - 1) * pageSize;
     const endIdx = startIdx + pageSize;
     
     // 分页过滤
     const pagedLogs = allLogs.slice(startIdx, endIdx);
     
     return {
       logs: pagedLogs,
       total: allLogs.length,
       page: page,
       pageSize: pageSize,
       totalPages: Math.ceil(allLogs.length / pageSize)
     };
   }
   ```

2. **更复杂的过滤器**：
   ```typescript
   // 添加按时间范围过滤
   const startTime = params.start_time || 0;
   const endTime = params.end_time || Date.now();
   
   const timeFilteredLogs = filteredLogs.filter((log: LogEntry) => {
     return log.time >= startTime && log.time <= endTime;
   });
   ```

## 发布新版本

1. **更新版本号**
   
   在 `package.json` 中更新版本号：
   
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **编译代码**
   
   ```bash
   tsc
   ```

3. **测试功能**
   
   在 Cocos Creator 中加载扩展，确保所有功能正常工作。

4. **更新文档**
   
   更新 README.md、USAGE.md 和其他文档，反映新功能或更改。

5. **创建 tag（可选）**
   
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

## 与 Cocos Creator API 交互

本扩展使用 Cocos Creator 编辑器的官方 API 与编辑器交互。主要使用的 API 包括：

- `Editor.Logger.query()`: 获取编辑器日志
- `Editor.Logger.clear()`: 清除编辑器日志
- `Editor.Message.addBroadcastListener()`: 监听消息广播

如果你需要添加更多功能，可以参考 [Cocos Creator 官方文档](https://docs.cocos.com/creator/3.8/manual/zh/editor/extension/api/) 了解更多可用的 API。

## 常见问题

### 类型定义问题

如果遇到类型定义问题，检查 `@types/editor.d.ts` 文件是否包含所需 API 的类型定义。可能需要添加更多类型定义：

```typescript
// 在 @types/editor.d.ts 中添加
declare global {
  const Editor: {
    // 现有类型
    Logger: { ... },
    Message: { ... },
    
    // 新增类型
    Scene: {
      callSceneScript(name: string, method: string, ...args: any[]): Promise<any>;
    }
  };
}
```

### 通信问题

如果 TCP 通信出现问题：

1. 确保端口没有被占用
2. 检查防火墙设置
3. 尝试使用不同的端口（需要同时修改编辑器扩展和 Python 服务器）

### 兼容性问题

不同版本的 Cocos Creator 可能有 API 差异。如果你的扩展需要支持多个版本的 Cocos Creator，请考虑使用条件逻辑：

```typescript
// 检查 Creator 版本
const version = Editor.App.version;
if (version.startsWith('3.8.')) {
  // 适用于 3.8.x 的代码
} else if (version.startsWith('3.7.')) {
  // 适用于 3.7.x 的代码
} else {
  console.warn(`Unsupported Cocos Creator version: ${version}`);
}
``` 