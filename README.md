# Gemini Web Summarizer Extension

🤖 一个基于Google Gemini AI的智能网页总结和流程图生成Chrome扩展

## 功能特性

### 🔥 核心功能
- **智能网页总结**: 使用Google Gemini AI对当前网页内容进行智能总结
- **流程图生成**: 基于网页内容自动生成Mermaid格式的流程图
- **一键复制**: 支持总结内容一键复制到剪贴板
- **图表交互**: 支持流程图的缩放、拖拽和导出功能

### ⚙️ 高级特性
- **API密钥管理**: 安全存储和验证Gemini API密钥
- **自定义设置**: 可调节AI创造性、输出长度等参数
- **多语言支持**: 支持中文简体、繁体和英文界面
- **使用统计**: 记录和显示扩展使用情况
- **设置导入导出**: 支持设置的备份和恢复

## 安装说明

### 1. 获取API密钥
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登录您的Google账户
3. 创建新的API密钥
4. 复制API密钥备用

### 2. 安装扩展
1. 下载或克隆此项目到本地
2. 打开Chrome浏览器，进入 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目文件夹 `gemini-web-summarizer-extension`
6. 扩展安装完成

### 3. 配置设置
1. 点击扩展图标，选择"设置"
2. 在API设置中输入您的Gemini API密钥
3. 点击"验证API密钥"确保密钥有效
4. 根据需要调整其他设置
5. 点击"保存设置"

## 使用方法

### 网页总结
1. 打开任意网页
2. 点击扩展图标
3. 在"总结"标签页中点击"总结当前页面"
4. 等待AI生成总结结果
5. 点击复制按钮将总结内容复制到剪贴板

### 流程图生成
1. 打开包含流程或步骤的网页
2. 点击扩展图标
3. 切换到"流程图"标签页
4. 点击"生成流程图"
5. 查看生成的Mermaid流程图
6. 使用控制按钮进行缩放、重置或下载

### 图表操作
- **缩放**: 使用 🔍+ 和 🔍- 按钮，或鼠标滚轮
- **拖拽**: 按住鼠标左键拖动图表
- **重置**: 点击 🔄 按钮恢复默认视图
- **下载**: 支持PNG和SVG格式导出

## 项目结构

```
gemini-web-summarizer-extension/
├── manifest.json           # 扩展清单文件
├── popup.html             # 弹出窗口界面
├── popup.js               # 弹出窗口逻辑
├── popup.css              # 弹出窗口样式
├── options.html           # 设置页面
├── options.js             # 设置页面逻辑
├── options.css            # 设置页面样式
├── content.js             # 内容脚本
├── background.js          # 后台脚本
├── lib/
│   └── gemini-api.js      # Gemini API封装
├── icons/                 # 图标文件夹
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # 项目说明
```

## 技术实现

### 技术栈
- **Chrome Extension Manifest V3**: 现代化的扩展开发规范
- **Google Gemini API**: 强大的AI内容生成能力
- **Mermaid.js**: 流程图渲染和交互
- **Vanilla JavaScript**: 轻量级无依赖实现
- **CSS3**: 现代化的界面设计

### 核心模块
1. **内容提取**: 智能识别和提取网页主要内容
2. **API调用**: 封装Gemini API调用逻辑
3. **图表渲染**: Mermaid图表的渲染和交互
4. **存储管理**: Chrome扩展存储API的使用
5. **错误处理**: 完善的错误处理和用户反馈

## 权限说明

扩展需要以下权限：
- `activeTab`: 访问当前活跃标签页内容
- `storage`: 存储用户设置和API密钥
- `scripting`: 在网页中注入内容脚本
- `https://generativelanguage.googleapis.com/*`: 调用Gemini API

## 隐私保护

- API密钥仅存储在本地，不会上传到任何服务器
- 网页内容仅在用户主动操作时发送给Gemini API
- 不收集任何用户个人信息
- 所有数据处理均在本地完成

## 故障排除

### 常见问题

**Q: 扩展无法总结页面内容**
A: 请检查：
1. API密钥是否正确设置
2. 网络连接是否正常
3. 当前页面是否为系统页面（如chrome://）

**Q: 流程图无法显示**
A: 请检查：
1. 网页内容是否包含明确的流程或步骤
2. 生成的Mermaid代码是否有语法错误
3. 尝试刷新页面后重新生成

**Q: API密钥验证失败**
A: 请确认：
1. API密钥是否从正确的Google AI Studio获取
2. API密钥是否有效且未过期
3. 是否有网络防火墙阻止API访问

### 调试模式
1. 打开Chrome开发者工具
2. 查看Console面板的错误信息
3. 检查Network面板的API请求状态

## 更新日志

### v1.0.0 (2025-06-26)
- 🎉 首次发布
- ✨ 实现网页内容智能总结功能
- ✨ 实现Mermaid流程图生成功能
- ✨ 实现图表交互和导出功能
- ✨ 实现完整的设置管理系统
- ✨ 实现使用统计和数据管理功能

## 开发计划

### 即将推出
- [ ] 支持更多AI模型（Claude、GPT等）
- [ ] 批量处理多个标签页
- [ ] 自定义总结模板
- [ ] 更多图表类型支持
- [ ] 快捷键操作

### 长期规划
- [ ] 移动端支持
- [ ] 团队协作功能
- [ ] 云端同步设置
- [ ] 插件生态系统

## 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]


---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
