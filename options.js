/**
 * 设置页面脚本
 * 处理扩展设置的保存、加载和验证
 */

// DOM元素引用
const elements = {
    // API设置
    apiKey: document.getElementById('api-key'),
    toggleApiKey: document.getElementById('toggle-api-key'),
    validateApiKey: document.getElementById('validate-api-key'),
    apiValidationResult: document.getElementById('api-validation-result'),
    
    // 功能设置
    extensionEnabled: document.getElementById('extension-enabled'),
    autoSummarize: document.getElementById('auto-summarize'),
    summaryLength: document.getElementById('summary-length'),
    customLengthOptions: document.getElementById('custom-length-options'),
    customLengthRange: document.getElementById('custom-length-range'),
    language: document.getElementById('language'),
    
    // 高级设置
    apiTemperature: document.getElementById('api-temperature'),
    temperatureValue: document.getElementById('temperature-value'),
    maxTokens: document.getElementById('max-tokens'),

    // 模型设置
    defaultModel: document.getElementById('default-model'),
    enableThinking: document.getElementById('enable-thinking'),
    thinkingBudget: document.getElementById('thinking-budget'),
    thinkingBudgetValue: document.getElementById('thinking-budget-value'),

    // 提示词设置
    summaryPromptTemplate: document.getElementById('summary-prompt-template'),
    customSummaryPrompt: document.getElementById('custom-summary-prompt'),
    flowchartPromptTemplate: document.getElementById('flowchart-prompt-template'),
    customFlowchartPrompt: document.getElementById('custom-flowchart-prompt'),
    resetPrompts: document.getElementById('reset-prompts'),
    testPrompt: document.getElementById('test-prompt'),
    
    // 数据管理
    summaryCount: document.getElementById('summary-count'),
    flowchartCount: document.getElementById('flowchart-count'),
    usageDays: document.getElementById('usage-days'),
    exportSettings: document.getElementById('export-settings'),
    importSettings: document.getElementById('import-settings'),
    importFile: document.getElementById('import-file'),
    resetSettings: document.getElementById('reset-settings'),
    
    // 保存和状态
    saveSettings: document.getElementById('save-settings'),
    saveStatus: document.getElementById('save-status'),
    
    // 确认对话框
    confirmDialog: document.getElementById('confirm-dialog'),
    confirmTitle: document.getElementById('confirm-title'),
    confirmMessage: document.getElementById('confirm-message'),
    confirmYes: document.getElementById('confirm-yes'),
    confirmNo: document.getElementById('confirm-no')
};

// 提示词模板
const promptTemplates = {
    summary: {
        default: `请对以下网页内容进行智能总结，要求：
1. 提取核心要点和关键信息
2. 保持逻辑清晰，结构化呈现
3. 总结长度控制在{length}
4. 使用中文回复

网页标题：{title}
网页URL：{url}
网页内容：{content}`,

        academic: `请以学术研究的角度对以下网页内容进行总结分析：
1. 识别主要论点和支撑证据
2. 分析方法论和研究框架
3. 总结关键发现和结论
4. 评估学术价值和局限性
5. 总结长度：{length}

标题：{title}
来源：{url}
内容：{content}`,

        business: `请从商业角度总结以下网页内容：
1. 识别商业机会和挑战
2. 分析市场趋势和竞争态势
3. 提取关键数据和指标
4. 总结商业价值和影响
5. 长度要求：{length}

标题：{title}
链接：{url}
内容：{content}`,

        casual: `请用轻松易懂的方式总结这个网页：
1. 用简单的话说明主要内容
2. 突出有趣或重要的点
3. 避免专业术语，通俗易懂
4. 长度：{length}

网页：{title}
内容：{content}`,

        technical: `请从技术角度深入分析以下内容：
1. 识别技术要点和实现方法
2. 分析技术架构和设计模式
3. 评估技术优势和局限性
4. 总结技术发展趋势
5. 详细程度：{length}

技术文档：{title}
来源：{url}
技术内容：{content}`
    },

    flowchart: {
        default: `基于以下网页内容，生成一个Mermaid格式的流程图，要求：
1. 提取主要流程和步骤
2. 使用flowchart TD语法
3. 节点名称使用中文
4. 只返回Mermaid代码，不要其他解释文字
5. 确保语法正确可渲染

网页标题：{title}
网页内容：{content}

请直接返回Mermaid代码：`,

        detailed: `请创建一个详细的Mermaid流程图，包含以下要素：
1. 完整的流程步骤和子步骤
2. 决策点和分支逻辑
3. 异常处理和错误流程
4. 使用flowchart TD语法
5. 中文节点标签

基于内容：{title}
详细信息：{content}

返回完整的Mermaid流程图代码：`,

        simple: `请生成一个简化的流程图，突出核心步骤：
1. 只包含主要流程节点
2. 简化决策点
3. 使用清晰的中文标签
4. Mermaid flowchart格式

内容：{title}
{content}

返回简化的Mermaid代码：`,

        decision: `请创建一个决策流程图，重点展示：
1. 关键决策点和判断条件
2. 不同选择的后果和路径
3. 最终结果和输出
4. 使用Mermaid语法

决策内容：{title}
详细信息：{content}

生成决策流程图：`
    }
};

// 默认设置
const defaultSettings = {
    geminiApiKey: '',
    extensionEnabled: true,
    autoSummarize: false,
    summaryLength: 'medium',
    customLengthRange: '300-500',
    language: 'zh-CN',
    apiTemperature: 0.7,
    defaultModel: 'gemini-2.5-flash-lite-preview-06-17',
    enableThinking: false,
    thinkingBudget: 10000,
    summaryPromptTemplate: 'default',
    customSummaryPrompt: '',
    flowchartPromptTemplate: 'default',
    customFlowchartPrompt: ''
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadSettings();
    setupEventListeners();
    await loadUsageStats();
});

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // API密钥显示/隐藏切换
    elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
    
    // API密钥验证
    elements.validateApiKey.addEventListener('click', handleValidateApiKey);
    
    // 滑块事件
    elements.apiTemperature.addEventListener('input', updateTemperatureValue);
    elements.thinkingBudget.addEventListener('input', updateThinkingBudgetValue);

    // 提示词模板切换
    elements.summaryPromptTemplate.addEventListener('change', updatePromptTemplates);
    elements.flowchartPromptTemplate.addEventListener('change', updatePromptTemplates);

    // 提示词管理
    elements.resetPrompts.addEventListener('click', handleResetPrompts);
    elements.testPrompt.addEventListener('click', handleTestPrompt);
    
    // 数据管理按钮
    elements.exportSettings.addEventListener('click', handleExportSettings);
    elements.importSettings.addEventListener('click', () => elements.importFile.click());
    elements.importFile.addEventListener('change', handleImportSettings);
    elements.resetSettings.addEventListener('click', handleResetSettings);
    
    // 保存设置
    elements.saveSettings.addEventListener('click', handleSaveSettings);
    
    // 确认对话框
    elements.confirmYes.addEventListener('click', handleConfirmYes);
    elements.confirmNo.addEventListener('click', hideConfirmDialog);
    
    // 长度选择变更监听
    elements.summaryLength.addEventListener('change', handleLengthChange);

    // 实时保存某些设置
    elements.extensionEnabled.addEventListener('change', autoSave);
    elements.autoSummarize.addEventListener('change', autoSave);
}

/**
 * 加载设置
 */
async function loadSettings() {
    try {
        const result = await chrome.storage.sync.get(Object.keys(defaultSettings));
        const settings = { ...defaultSettings, ...result };
        
        // 填充表单
        elements.apiKey.value = settings.geminiApiKey || '';
        elements.extensionEnabled.checked = settings.extensionEnabled;
        elements.autoSummarize.checked = settings.autoSummarize;
        elements.summaryLength.value = settings.summaryLength;
        elements.customLengthRange.value = settings.customLengthRange || '300-500';
        elements.language.value = settings.language;
        elements.apiTemperature.value = settings.apiTemperature;

        // 显示或隐藏自定义长度选项
        if (settings.summaryLength === 'custom') {
            elements.customLengthOptions.style.display = 'block';
        } else {
            elements.customLengthOptions.style.display = 'none';
        }

        // 模型设置
        elements.defaultModel.value = settings.defaultModel;
        elements.enableThinking.checked = settings.enableThinking;
        elements.thinkingBudget.value = settings.thinkingBudget;

        // 提示词设置
        elements.summaryPromptTemplate.value = settings.summaryPromptTemplate;
        elements.customSummaryPrompt.value = settings.customSummaryPrompt;
        elements.flowchartPromptTemplate.value = settings.flowchartPromptTemplate;
        elements.customFlowchartPrompt.value = settings.customFlowchartPrompt;

        // 更新显示
        updateTemperatureValue();
        updateThinkingBudgetValue();
        updatePromptTemplates();
        
        showStatus('设置已加载', 'success');
        
    } catch (error) {
        console.error('加载设置失败:', error);
        showStatus('加载设置失败', 'error');
    }
}

/**
 * 保存设置
 */
async function handleSaveSettings() {
    setButtonLoading(elements.saveSettings, true);
    
    try {
        const settings = {
            geminiApiKey: elements.apiKey.value.trim(),
            extensionEnabled: elements.extensionEnabled.checked,
            autoSummarize: elements.autoSummarize.checked,
            summaryLength: elements.summaryLength.value,
            customLengthRange: elements.customLengthRange.value.trim(),
            language: elements.language.value,
            apiTemperature: parseFloat(elements.apiTemperature.value),
            defaultModel: elements.defaultModel.value,
            enableThinking: elements.enableThinking.checked,
            thinkingBudget: parseInt(elements.thinkingBudget.value),
            summaryPromptTemplate: elements.summaryPromptTemplate.value,
            customSummaryPrompt: elements.customSummaryPrompt.value.trim(),
            flowchartPromptTemplate: elements.flowchartPromptTemplate.value,
            customFlowchartPrompt: elements.customFlowchartPrompt.value.trim()
        };
        
        // 验证设置
        if (!validateSettings(settings)) {
            return;
        }
        
        // 保存到Chrome存储
        await chrome.storage.sync.set(settings);
        
        showStatus('设置已保存', 'success');
        
    } catch (error) {
        console.error('保存设置失败:', error);
        showStatus('保存设置失败', 'error');
    } finally {
        setButtonLoading(elements.saveSettings, false);
    }
}

/**
 * 自动保存重要设置
 */
async function autoSave() {
    try {
        const settings = {
            extensionEnabled: elements.extensionEnabled.checked,
            autoSummarize: elements.autoSummarize.checked,
            summaryLength: elements.summaryLength.value,
            customLengthRange: elements.customLengthRange.value.trim()
        };
        
        await chrome.storage.sync.set(settings);
        
    } catch (error) {
        console.error('自动保存失败:', error);
    }
}

/**
 * 验证设置
 */
function validateSettings(settings) {
    if (settings.extensionEnabled && !settings.geminiApiKey) {
        showStatus('启用扩展功能需要设置API密钥', 'error');
        return false;
    }
    
    if (settings.apiTemperature < 0 || settings.apiTemperature > 1) {
        showStatus('温度值必须在0-1之间', 'error');
        return false;
    }
    
    if (settings.maxTokens < 100 || settings.maxTokens > 8192) {
        showStatus('最大输出长度必须在100-8192之间', 'error');
        return false;
    }
    
    return true;
}

/**
 * 处理长度选择变更
 */
function handleLengthChange() {
    const selectedLength = elements.summaryLength.value;

    // 显示或隐藏自定义长度选项
    if (selectedLength === 'custom') {
        elements.customLengthOptions.style.display = 'block';
        elements.customLengthRange.focus();
    } else {
        elements.customLengthOptions.style.display = 'none';
    }

    // 自动保存
    autoSave();
}

/**
 * 切换API密钥显示/隐藏
 */
function toggleApiKeyVisibility() {
    const isPassword = elements.apiKey.type === 'password';
    elements.apiKey.type = isPassword ? 'text' : 'password';
    elements.toggleApiKey.textContent = isPassword ? '🙈' : '👁️';
}

/**
 * 验证API密钥
 */
async function handleValidateApiKey() {
    const apiKey = elements.apiKey.value.trim();
    
    if (!apiKey) {
        showValidationResult('请先输入API密钥', 'error');
        return;
    }
    
    setButtonLoading(elements.validateApiKey, true);
    
    try {
        const isValid = await validateGeminiApiKey(apiKey);
        
        if (isValid) {
            showValidationResult('✅ API密钥验证成功', 'success');
        } else {
            showValidationResult('❌ API密钥验证失败，请检查密钥是否正确', 'error');
        }
        
    } catch (error) {
        console.error('API密钥验证失败:', error);
        showValidationResult('❌ 验证过程中发生错误，请检查网络连接', 'error');
    } finally {
        setButtonLoading(elements.validateApiKey, false);
    }
}

/**
 * 验证Gemini API密钥
 */
async function validateGeminiApiKey(apiKey) {
    // 安全修复：将API密钥放在请求头中
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

    const requestBody = {
        contents: [{
            parts: [{
                text: 'Hello'
            }]
        }],
        generationConfig: {
            maxOutputTokens: 10,
            temperature: 0.1,
            // 禁用思考功能以提高验证速度
            thinkingConfig: {
                thinkingBudget: 0
            }
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey  // 安全修复：使用请求头传递API密钥
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            // 检查响应是否包含有效内容
            return data.candidates && data.candidates.length > 0 &&
                   data.candidates[0].content && data.candidates[0].content.parts;
        }

        // 记录详细的错误信息以便调试
        const errorData = await response.json().catch(() => ({}));
        console.error('API验证失败:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
        });

        return false;

    } catch (error) {
        console.error('API验证请求失败:', error);
        return false;
    }
}

/**
 * 更新温度值显示
 */
function updateTemperatureValue() {
    elements.temperatureValue.textContent = elements.apiTemperature.value;
}

/**
 * 更新思考预算值显示
 */
function updateThinkingBudgetValue() {
    elements.thinkingBudgetValue.textContent = elements.thinkingBudget.value;
}

/**
 * 更新提示词模板
 */
function updatePromptTemplates() {
    // 更新总结提示词
    const summaryTemplate = elements.summaryPromptTemplate.value;
    if (summaryTemplate !== 'custom') {
        elements.customSummaryPrompt.value = promptTemplates.summary[summaryTemplate] || '';
        elements.customSummaryPrompt.disabled = true;
        elements.customSummaryPrompt.style.backgroundColor = '#f8f9fa';
    } else {
        elements.customSummaryPrompt.disabled = false;
        elements.customSummaryPrompt.style.backgroundColor = 'white';
        if (!elements.customSummaryPrompt.value.trim()) {
            elements.customSummaryPrompt.value = promptTemplates.summary.default;
        }
    }

    // 更新流程图提示词
    const flowchartTemplate = elements.flowchartPromptTemplate.value;
    if (flowchartTemplate !== 'custom') {
        elements.customFlowchartPrompt.value = promptTemplates.flowchart[flowchartTemplate] || '';
        elements.customFlowchartPrompt.disabled = true;
        elements.customFlowchartPrompt.style.backgroundColor = '#f8f9fa';
    } else {
        elements.customFlowchartPrompt.disabled = false;
        elements.customFlowchartPrompt.style.backgroundColor = 'white';
        if (!elements.customFlowchartPrompt.value.trim()) {
            elements.customFlowchartPrompt.value = promptTemplates.flowchart.default;
        }
    }
}

/**
 * 重置提示词为默认值
 */
function handleResetPrompts() {
    showConfirmDialog(
        '重置提示词',
        '确定要重置所有提示词模板为默认值吗？',
        () => {
            elements.summaryPromptTemplate.value = 'default';
            elements.flowchartPromptTemplate.value = 'default';
            elements.customSummaryPrompt.value = '';
            elements.customFlowchartPrompt.value = '';
            updatePromptTemplates();
            showStatus('提示词已重置为默认值', 'success');
        }
    );
}

/**
 * 测试提示词
 */
async function handleTestPrompt() {
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey) {
        showStatus('请先设置API密钥', 'error');
        return;
    }

    setButtonLoading(elements.testPrompt, true);

    try {
        // 使用测试数据
        const testData = {
            title: '测试网页标题',
            url: 'https://example.com',
            content: '这是一个测试网页的内容，用于验证提示词模板是否正常工作。',
            length: '简短总结'
        };

        // 获取当前提示词
        const summaryPrompt = elements.customSummaryPrompt.value;
        const processedPrompt = processPromptTemplate(summaryPrompt, testData);

        // 调用API测试
        const result = await window.callGeminiAPI(apiKey, processedPrompt, {
            maxOutputTokens: 200,
            temperature: 0.7
        });

        showStatus('提示词测试成功！查看控制台获取详细结果', 'success');
        console.log('提示词测试结果:', result);

    } catch (error) {
        console.error('提示词测试失败:', error);
        showStatus('提示词测试失败: ' + error.message, 'error');
    } finally {
        setButtonLoading(elements.testPrompt, false);
    }
}

/**
 * 处理提示词模板变量
 */
function processPromptTemplate(template, data) {
    return template
        .replace(/\{title\}/g, data.title || '')
        .replace(/\{url\}/g, data.url || '')
        .replace(/\{content\}/g, data.content || '')
        .replace(/\{length\}/g, data.length || '中等长度');
}

/**
 * 加载使用统计
 */
async function loadUsageStats() {
    try {
        const result = await chrome.storage.local.get(['usageStats']);
        const stats = result.usageStats || {};
        
        let summaryCount = 0;
        let flowchartCount = 0;
        let usageDays = 0;
        
        // 计算统计数据
        for (const date in stats) {
            usageDays++;
            const dayStats = stats[date];
            summaryCount += dayStats.summarize || 0;
            flowchartCount += dayStats.generateFlowchart || 0;
        }
        
        // 更新显示
        elements.summaryCount.textContent = summaryCount;
        elements.flowchartCount.textContent = flowchartCount;
        elements.usageDays.textContent = usageDays;
        
    } catch (error) {
        console.error('加载使用统计失败:', error);
    }
}

/**
 * 导出设置
 */
async function handleExportSettings() {
    try {
        const settings = await chrome.storage.sync.get();
        const exportData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            settings: settings
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gemini-summarizer-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showStatus('设置已导出', 'success');
        
    } catch (error) {
        console.error('导出设置失败:', error);
        showStatus('导出设置失败', 'error');
    }
}

/**
 * 导入设置
 */
async function handleImportSettings(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        if (!importData.settings) {
            throw new Error('无效的设置文件格式');
        }
        
        // 验证导入的设置
        const settings = { ...defaultSettings, ...importData.settings };
        
        if (!validateSettings(settings)) {
            return;
        }
        
        // 保存设置
        await chrome.storage.sync.set(settings);
        
        // 重新加载页面设置
        await loadSettings();
        
        showStatus('设置已导入', 'success');
        
    } catch (error) {
        console.error('导入设置失败:', error);
        showStatus('导入设置失败：' + error.message, 'error');
    } finally {
        // 清空文件输入
        elements.importFile.value = '';
    }
}

/**
 * 重置设置
 */
function handleResetSettings() {
    showConfirmDialog(
        '重置设置',
        '确定要重置所有设置到默认值吗？此操作不可撤销。',
        async () => {
            try {
                await chrome.storage.sync.clear();
                await chrome.storage.local.clear();
                await loadSettings();
                await loadUsageStats();
                showStatus('设置已重置', 'success');
            } catch (error) {
                console.error('重置设置失败:', error);
                showStatus('重置设置失败', 'error');
            }
        }
    );
}

// 全局确认回调
let confirmCallback = null;

/**
 * 显示确认对话框
 */
function showConfirmDialog(title, message, callback) {
    elements.confirmTitle.textContent = title;
    elements.confirmMessage.textContent = message;
    elements.confirmDialog.style.display = 'flex';
    confirmCallback = callback;
}

/**
 * 隐藏确认对话框
 */
function hideConfirmDialog() {
    elements.confirmDialog.style.display = 'none';
    confirmCallback = null;
}

/**
 * 处理确认
 */
function handleConfirmYes() {
    hideConfirmDialog();
    if (confirmCallback) {
        confirmCallback();
    }
}

/**
 * 显示验证结果
 */
function showValidationResult(message, type) {
    elements.apiValidationResult.textContent = message;
    elements.apiValidationResult.className = `validation-result ${type}`;
    elements.apiValidationResult.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        elements.apiValidationResult.style.display = 'none';
    }, 3000);
}

/**
 * 显示状态消息
 */
function showStatus(message, type) {
    elements.saveStatus.textContent = message;
    elements.saveStatus.className = `save-status ${type}`;
    
    // 3秒后清除状态
    setTimeout(() => {
        elements.saveStatus.textContent = '';
        elements.saveStatus.className = 'save-status';
    }, 3000);
}

/**
 * 设置按钮加载状态
 */
function setButtonLoading(button, isLoading) {
    const textSpan = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');
    
    if (isLoading) {
        textSpan.style.display = 'none';
        spinner.style.display = 'inline';
        button.disabled = true;
    } else {
        textSpan.style.display = 'inline';
        spinner.style.display = 'none';
        button.disabled = false;
    }
}
