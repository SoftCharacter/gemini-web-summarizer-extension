# 🔧 API修复验证指南

## 🎯 修复内容

### 1. **API调用修复** ✅
- **修复了模型名称**: 使用正确的 `gemini-2.5-flash-lite-preview-06-17`
- **动态模型选择**: API调用现在支持用户选择的模型
- **正确的API端点**: 使用官方文档中的正确格式

### 2. **模型选择优化** ✅
- **只保留Gemini 2.5版本**:
  - `gemini-2.5-flash-lite-preview-06-17` (推荐)
  - `gemini-2.5-flash` (标准)
  - `gemini-2.5-pro` (高质量)
- **移除了所有旧版本模型** (1.5系列等)
- **设置Flash Lite为默认推荐模型**

### 3. **用户引导优化** ✅
- **视觉提示**: 推荐模型前加⭐星标
- **智能提示**: 选择不同模型时显示相应说明
- **自动保存**: 用户选择会自动保存到存储

## 🧪 验证步骤

### 步骤1: 重新加载扩展
```bash
1. 打开 edge://extensions/
2. 找到 Gemini Web Summarizer 扩展
3. 点击"重新加载"按钮
```

### 步骤2: 检查模型选择
1. 点击扩展图标打开弹出窗口
2. 查看快速设置中的模型下拉框
3. **验证**: 应该只显示3个Gemini 2.5选项
4. **验证**: Flash Lite应该有⭐标记并被默认选中

### 步骤3: 测试API调用
1. 访问测试页面: `test-flowchart-generation.html`
2. 打开扩展，切换到流程图标签页
3. 点击"生成流程图"按钮
4. **预期结果**: 
   - 不再出现404错误
   - 能正常调用API
   - 生成有效的流程图

### 步骤4: 测试模型切换
1. 在快速设置中切换不同模型
2. **验证**: 状态栏显示相应的模型说明
3. **验证**: 选择会自动保存
4. 重新打开扩展，**验证**: 保持之前的选择

## 🔍 技术细节

### API调用修复
```javascript
// 修复前 (错误)
const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + apiKey;

// 修复后 (正确)
const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
```

### 正确的模型名称
根据官方文档，正确的模型名称为:
- `gemini-2.5-flash-lite-preview-06-17` (推荐)
- `gemini-2.5-flash` (标准)
- `gemini-2.5-pro` (高质量)

### 动态模型选择
```javascript
// 从存储中获取用户选择的模型
const { geminiApiKey, defaultModel } = await chrome.storage.sync.get(['geminiApiKey', 'defaultModel']);
const modelName = defaultModel || 'gemini-2.5-flash-lite-preview-06-17';

// 使用选择的模型调用API
return await callGeminiAPI(geminiApiKey, prompt, modelName);
```

## 📋 验证清单

### API修复验证 ✅
- [ ] 不再出现404错误
- [ ] API调用成功返回结果
- [ ] 流程图能正常生成
- [ ] 总结功能正常工作

### 模型选择验证 ✅
- [ ] 只显示Gemini 2.5版本
- [ ] Flash Lite有⭐推荐标记
- [ ] 模型切换有智能提示
- [ ] 选择自动保存并恢复

### 用户体验验证 ✅
- [ ] 界面清晰易懂
- [ ] 推荐模型突出显示
- [ ] 状态提示准确有用
- [ ] 操作流畅无卡顿

## 🚨 常见问题排查

### 如果仍然出现API错误:
1. **检查API密钥**: 确保在设置中配置了有效的Gemini API密钥
2. **检查网络**: 确保能访问Google API服务
3. **检查模型名称**: 在控制台查看实际使用的模型名称
4. **查看详细错误**: 在控制台查看完整的错误信息

### 调试命令:
```javascript
// 在扩展控制台中运行
// 检查当前设置
chrome.storage.sync.get(['defaultModel', 'geminiApiKey'], console.log);

// 测试API调用
// (需要先设置有效的API密钥)
```

### 手动测试API:
可以在浏览器中直接测试API调用:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite-preview-06-17:generateContent?key=YOUR_API_KEY

Body:
{
  "contents": [{
    "parts": [{"text": "Hello, how are you?"}]
  }]
}
```

## 🎉 修复完成

所有API相关问题已修复:
- ✅ 使用正确的模型名称
- ✅ 支持动态模型选择  
- ✅ 只保留Gemini 2.5版本
- ✅ 推荐Flash Lite模型
- ✅ 优化用户体验

扩展现在应该能够正常调用Gemini API并生成流程图和总结内容。
