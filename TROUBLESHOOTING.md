# 🔧 故障排除指南

## 问题：流程图和设置按钮无反应

### 快速诊断步骤

#### 1. 检查扩展是否正确加载
1. 重新加载扩展：
   - 打开 `edge://extensions/`
   - 找到 Gemini Web Summarizer 扩展
   - 点击"重新加载"按钮

#### 2. 检查控制台错误
1. 右键点击扩展图标
2. 选择"检查"或"审查元素"
3. 查看Console面板是否有错误信息

#### 3. 使用调试功能
在扩展的控制台中运行以下命令：

```javascript
// 检查DOM元素状态
debugElements()

// 测试设置按钮点击
testClick()

// 测试标签页切换
testTabSwitch('flowchart')

// 强制隐藏API提示框（如果它阻挡了界面）
hideApiPrompt()
```

### 常见问题和解决方案

#### 问题1：API密钥提示框覆盖整个界面
**症状**: 看到"需要设置API密钥"的提示框，但无法点击任何按钮

**解决方案**:
1. 在控制台运行: `hideApiPrompt()`
2. 或者点击"前往设置"按钮设置API密钥
3. 或者在控制台运行: `chrome.storage.sync.set({geminiApiKey: 'your-api-key'})`

#### 问题2：DOM元素未正确加载
**症状**: 控制台显示"元素缺失或未找到"

**解决方案**:
1. 确保所有文件都已正确保存
2. 重新加载扩展
3. 检查HTML文件是否有语法错误

#### 问题3：事件监听器未绑定
**症状**: 按钮存在但点击无反应

**解决方案**:
1. 在控制台检查: `debugElements()`
2. 手动绑定事件: 
```javascript
document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});
```

#### 问题4：JavaScript加载顺序问题
**症状**: 脚本加载错误或函数未定义

**解决方案**:
1. 检查HTML中脚本加载顺序
2. 确保所有依赖文件都存在
3. 重新加载扩展

### 手动修复步骤

#### 如果自动修复失败，可以手动执行：

1. **手动设置API密钥**:
```javascript
chrome.storage.sync.set({
    geminiApiKey: 'your-actual-api-key-here'
});
```

2. **手动切换标签页**:
```javascript
// 切换到流程图标签
document.querySelector('[data-tab="flowchart"]').click();
```

3. **手动打开设置页面**:
```javascript
chrome.runtime.openOptionsPage();
```

4. **手动隐藏API提示框**:
```javascript
document.getElementById('api-key-prompt').style.display = 'none';
```

### 调试信息收集

如果问题仍然存在，请收集以下信息：

1. **浏览器信息**:
   - Edge版本号
   - 操作系统版本

2. **控制台输出**:
   - 打开扩展的开发者工具
   - 复制所有错误信息和警告

3. **DOM状态**:
   - 运行 `debugElements()` 的输出结果

4. **存储状态**:
```javascript
chrome.storage.sync.get(null, (result) => {
    console.log('当前存储状态:', result);
});
```

### 完全重置扩展

如果所有方法都失败，可以完全重置：

1. **清除所有数据**:
```javascript
chrome.storage.sync.clear();
chrome.storage.local.clear();
```

2. **重新加载扩展**:
   - 在扩展管理页面点击"重新加载"

3. **重新配置**:
   - 设置API密钥
   - 配置其他选项

### 联系支持

如果问题仍然存在，请提供：
- 浏览器版本
- 错误信息截图
- 控制台输出
- 具体的操作步骤

---

## 快速测试命令

在扩展控制台中运行这些命令来快速测试功能：

```javascript
// 1. 检查所有元素
debugElements()

// 2. 测试按钮点击
testClick()

// 3. 切换标签页
testTabSwitch('summary')
testTabSwitch('flowchart')

// 4. 检查API密钥
chrome.storage.sync.get(['geminiApiKey'], console.log)

// 5. 隐藏API提示框
hideApiPrompt()

// 6. 手动打开设置
chrome.runtime.openOptionsPage()
```

这些命令可以帮助您快速诊断和解决大部分常见问题。
