# Cocos MCP Log Bridge

一个强大的日志桥接工具，用于在 Cocos Creator 编辑器和 Cursor AI 之间同步日志信息，帮助开发者更有效地分析和解决问题。

[![GitHub stars](https://img.shields.io/github/stars/czh2774/cocosMCP.svg)](https://github.com/czh2774/cocosMCP/stargazers)
[![License](https://img.shields.io/github/license/czh2774/cocosMCP.svg)](https://github.com/czh2774/cocosMCP/blob/main/LICENSE)

![Cocos MCP Log Bridge](https://img.shields.io/badge/Cocos%20Creator-3.8.0%2B-blue)
![Cursor AI](https://img.shields.io/badge/Cursor%20AI-Compatible-green)

## 🌟 功能特点

- **实时日志同步**: 直接从 Cocos Creator 编辑器获取最新日志
- **智能过滤**: 支持按类型过滤（普通日志、警告、错误）
- **关键词搜索**: 精确定位特定问题
- **一键清除**: 随时清空日志以减少干扰
- **TCP 通信桥接**: 稳定可靠的通信机制
- **Cursor AI 集成**: 完全兼容 Cursor MCP 协议

## 🚀 快速入门

### 前置条件

- Cocos Creator 3.8.0 或更高版本
- Python 3.7 或更高版本
- uv 包管理器 (推荐) 或 pip

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/czh2774/cocosMCP.git
   ```

2. **复制到 Cocos Creator 项目**
   
   将克隆的 `cocosMCP` 目录复制到你的 Cocos Creator 项目的 `extensions` 目录下。

3. **安装 Python 依赖**
   ```bash
   cd your-project/extensions/cocosMCP/Python
   uv pip install -r requirements.txt
   ```

4. **在 Cocos Creator 中启用扩展**
   
   启动 Cocos Creator，进入 `扩展 -> 扩展管理器`，确保 `cocosMCP` 扩展已启用。

5. **配置 Cursor AI**
   
   在 Cursor AI 设置中配置 MCP 服务器，指向 Python 服务器脚本。

### 基本用法

```python
# 查询日志
logs = await mcp.query_logs({
    "show_logs": True,
    "show_warnings": True,
    "show_errors": True
})

# 清除日志
await mcp.clear_logs()

# 检查连接状态
status = await mcp.connection_status()
```

## 📚 详细文档

本项目包含三个详细的文档:

- [用户使用指南](USAGE.md): 安装、配置和使用方法
- [开发者指南](DEVELOPMENT.md): 代码结构、扩展功能和维护说明
- [问题排查](TROUBLESHOOTING.md): 常见问题和解决方案

## 🔧 技术架构

Cocos MCP 由三个主要部分组成:

1. **Cocos Creator 扩展**: TypeScript 编写的编辑器扩展
2. **TCP 通信桥**: 连接编辑器和 Python 服务器
3. **Python MCP 服务器**: 处理 Cursor AI 的请求

![架构图](https://via.placeholder.com/800x400?text=Cocos+MCP+Architecture)

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！请查看 [开发者指南](DEVELOPMENT.md) 了解详情。

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- Cocos Creator 团队提供的优秀游戏引擎
- Cursor AI 团队开发的智能编程助手
- 所有贡献者和用户的支持和反馈

---

如有问题或建议，请提交 [Issues](https://github.com/czh2774/cocosMCP/issues)。 