/**
 * 修复版popup.js - 移除所有语法错误
 */

// 全局变量
let currentZoom = 1;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let chartOffset = { x: 0, y: 0 };
let elements = {};

console.log('修复版popup.js开始加载...');

// 初始化DOM元素
function initializeElements() {
    console.log('开始初始化DOM元素...');
    
    elements = {
        tabButtons: document.querySelectorAll('.tab-button'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        summarizeBtn: document.getElementById('summarize-btn'),
        generateFlowchartBtn: document.getElementById('generate-flowchart-btn'),
        copySummaryBtn: document.getElementById('copy-summary-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        openSettingsBtn: document.getElementById('open-settings-btn'),
        summaryResult: document.getElementById('summary-result'),
        flowchartResult: document.getElementById('flowchart-result'),
        summaryContent: document.getElementById('summary-content'),
        mermaidChart: document.getElementById('mermaid-chart'),
        statusMessage: document.getElementById('status-message'),
        apiKeyPrompt: document.getElementById('api-key-prompt'),
        quickModelSelect: document.getElementById('quick-model-select'),

        // Chart control buttons
        zoomInBtn: document.getElementById('zoom-in-btn'),
        zoomOutBtn: document.getElementById('zoom-out-btn'),
        resetZoomBtn: document.getElementById('reset-zoom-btn'),
        downloadPngBtn: document.getElementById('download-png-btn'),
        downloadSvgBtn: document.getElementById('download-svg-btn')
    };
    
    console.log('DOM元素初始化完成:', {
        tabButtons: elements.tabButtons.length,
        settingsBtn: !!elements.settingsBtn,
        generateFlowchartBtn: !!elements.generateFlowchartBtn
    });
}

// 设置事件监听器
function setupEventListeners() {
    console.log('开始设置事件监听器...');
    
    try {
        // 标签页切换
        if (elements.tabButtons && elements.tabButtons.length > 0) {
            elements.tabButtons.forEach((button, index) => {
                console.log('设置标签页按钮', index, '事件监听器:', button.dataset.tab);
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('标签页按钮被点击:', button.dataset.tab);
                    switchTab(button.dataset.tab);
                });
            });
        }
        
        // 设置按钮
        if (elements.settingsBtn) {
            elements.settingsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('设置按钮被点击');
                openSettings();
            });
            console.log('设置按钮事件监听器已设置');
        } else {
            console.error('设置按钮未找到');
        }
        
        // 总结按钮
        if (elements.summarizeBtn) {
            elements.summarizeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('总结按钮被点击');
                handleSummarize();
            });
        }
        
        // 流程图按钮
        if (elements.generateFlowchartBtn) {
            elements.generateFlowchartBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('流程图按钮被点击');
                handleGenerateFlowchart();
            });
        }

        // Chart control buttons
        if (elements.zoomInBtn) {
            elements.zoomInBtn.addEventListener('click', () => zoomChart(1.2));
        }
        if (elements.zoomOutBtn) {
            elements.zoomOutBtn.addEventListener('click', () => zoomChart(0.8));
        }
        if (elements.resetZoomBtn) {
            elements.resetZoomBtn.addEventListener('click', resetChartView);
        }
        if (elements.downloadPngBtn) {
            elements.downloadPngBtn.addEventListener('click', () => downloadChart('png'));
        }
        if (elements.downloadSvgBtn) {
            elements.downloadSvgBtn.addEventListener('click', () => downloadChart('svg'));
        }

        // 模型选择变更监听
        if (elements.quickModelSelect) {
            elements.quickModelSelect.addEventListener('change', handleModelChange);
        }



        console.log('所有事件监听器设置完成');
        
    } catch (error) {
        console.error('设置事件监听器时发生错误:', error);
    }
}

// 切换标签页
function switchTab(tabName) {
    console.log('切换到标签页:', tabName);
    
    try {
        // 移除所有按钮的active类
        if (elements.tabButtons && elements.tabButtons.length > 0) {
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
        }
        
        // 移除所有标签页内容的active类
        if (elements.tabPanes && elements.tabPanes.length > 0) {
            elements.tabPanes.forEach(pane => pane.classList.remove('active'));
        }
        
        // 激活选中的按钮
        const activeButton = document.querySelector('[data-tab="' + tabName + '"]');
        if (activeButton) {
            activeButton.classList.add('active');
            console.log('按钮激活成功:', tabName);
        } else {
            console.error('未找到标签页按钮:', tabName);
        }
        
        // 激活选中的标签页内容
        const activeTab = document.getElementById(tabName + '-tab');
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('标签页内容激活成功:', tabName);
        } else {
            console.error('未找到标签页内容:', tabName + '-tab');
        }
        
        // 移除标签页切换的状态提示
        
    } catch (error) {
        console.error('切换标签页时发生错误:', error);
    }
}

// 打开设置页面
function openSettings() {
    console.log('尝试打开设置页面...');
    
    try {
        if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
            console.log('设置页面打开成功');
            updateStatus('设置页面已打开');
        } else {
            console.error('chrome.runtime.openOptionsPage 不可用');
            updateStatus('无法打开设置页面');
        }
    } catch (error) {
        console.error('打开设置页面失败:', error);
        updateStatus('打开设置页面失败: ' + error.message);
    }
}

// 更新状态消息
function updateStatus(message) {
    console.log('状态更新:', message);
    if (elements.statusMessage) {
        elements.statusMessage.textContent = message;
    }
}

// 处理总结功能
async function handleSummarize() {
    if (!(await checkApiKey())) return;

    setButtonLoading(elements.summarizeBtn, true);
    updateStatus('正在获取页面内容...');

    try {
        // 获取当前标签页内容
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const pageContent = await getPageContent(tab.id);

        if (!pageContent) {
            throw new Error('无法获取页面内容');
        }

        updateStatus('正在生成总结...');

        // 调用Gemini API生成总结
        const summary = await generateSummary(pageContent);

        // 显示总结结果
        elements.summaryContent.innerHTML = formatSummary(summary);
        elements.summaryResult.style.display = 'block';

        updateStatus('总结完成');
    } catch (error) {
        console.error('总结失败:', error);
        const errorInfo = analyzeError(error);
        updateStatus(`总结失败: ${errorInfo.message}`);
        showDetailedError('总结失败', errorInfo);
    } finally {
        setButtonLoading(elements.summarizeBtn, false);
    }
}

// 处理流程图生成
async function handleGenerateFlowchart() {
    if (!(await checkApiKey())) return;

    setButtonLoading(elements.generateFlowchartBtn, true);
    updateStatus('正在获取页面内容...');

    try {
        // 获取当前标签页内容
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const pageContent = await getPageContent(tab.id);

        if (!pageContent) {
            throw new Error('无法获取页面内容');
        }

        updateStatus('正在生成流程图...');

        // 调用Gemini API生成Mermaid代码
        console.log('开始生成流程图，页面内容:', pageContent);
        const mermaidCode = await generateFlowchart(pageContent);

        if (!mermaidCode || mermaidCode.trim().length === 0) {
            throw new Error('生成的Mermaid代码为空');
        }

        console.log('生成的Mermaid代码:', mermaidCode);

        // 渲染Mermaid图表
        await renderChart(mermaidCode);

        elements.flowchartResult.style.display = 'block';
        updateStatus('流程图生成完成');
    } catch (error) {
        console.error('流程图生成失败:', error);
        const errorInfo = analyzeError(error);
        updateStatus(`流程图生成失败: ${errorInfo.message}`);
        showDetailedError('流程图生成失败', errorInfo);
    } finally {
        setButtonLoading(elements.generateFlowchartBtn, false);
    }
}

// 检查API密钥
async function checkApiKey() {
    console.log('检查API密钥...');
    
    try {
        const result = await chrome.storage.sync.get(['geminiApiKey']);
        console.log('API密钥检查结果:', { hasKey: !!result.geminiApiKey });
        
        if (!result.geminiApiKey || result.geminiApiKey.trim() === '') {
            console.log('API密钥未设置');
            if (elements.apiKeyPrompt) {
                elements.apiKeyPrompt.style.display = 'flex';
            }
            updateStatus('请设置Gemini API密钥');
            return false;
        } else {
            console.log('API密钥已设置');
            if (elements.apiKeyPrompt) {
                elements.apiKeyPrompt.style.display = 'none';
            }
            updateStatus('API密钥已配置');
            return true;
        }
    } catch (error) {
        console.error('检查API密钥失败:', error);
        updateStatus('检查API密钥失败');
        return false;
    }
}

// 处理模型选择变更
function handleModelChange() {
    const selectedModel = elements.quickModelSelect.value;

    // 保存选择的模型
    chrome.storage.sync.set({ defaultModel: selectedModel });

    // 根据选择的模型给出提示
    if (selectedModel === 'gemini-2.5-flash-lite-preview-06-17') {
        updateStatus('已选择推荐模型 Flash Lite - 速度快，成本低');
    } else if (selectedModel === 'gemini-2.5-flash') {
        updateStatus('已选择 Flash 模型 - 平衡性能');
    } else if (selectedModel === 'gemini-2.5-pro') {
        updateStatus('已选择 Pro 模型 - 高质量输出');
    }

    console.log('模型已切换到:', selectedModel);
}



// 智能计算最佳Token数量
async function calculateOptimalTokens(modelName, prompt) {
    // 根据Google官方文档的模型限制
    const modelLimits = {
        'gemini-2.5-pro': 65536,
        'gemini-2.5-flash': 65536,
        'gemini-2.5-flash-lite-preview-06-17': 64000
    };

    // 获取模型的最大限制
    const maxLimit = modelLimits[modelName] || 8192;

    // 估算所需的token数量
    let estimatedTokens = await estimateRequiredTokens();



    // 根据思考模式启用状态动态预留token空间
    const { enableThinking = false } = await chrome.storage.sync.get(['enableThinking']);
    const { thinkingBudget = 1024 } = await chrome.storage.sync.get(['thinkingBudget']);
    const originalTokens = estimatedTokens;
    let multiplier = 1;

    // 检查是否为动态思考模式（thinkingBudget为0）
    if (enableThinking && thinkingBudget === 0) {
        console.log(`🌟 动态思考模式已启用，返回模型最大token输出量: ${maxLimit}`);
        return maxLimit;
    }

    if (enableThinking) {
        // 启用思考模式时，为思考过程预留更多空间
        if (modelName.includes('gemini-2.5-pro')) {
            // Pro模型思考能力最强，预留更多空间
            multiplier = 2.5;
            estimatedTokens = parseInt(Math.min(thinkingBudget + estimatedTokens * multiplier, maxLimit));
        } else if (modelName.includes('gemini-2.5-flash')) {
            // Flash模型预留适中空间
            multiplier = 2.0;
            estimatedTokens = parseInt(Math.min(thinkingBudget + estimatedTokens * multiplier, maxLimit));
        } else if (modelName.includes('gemini-2.5-flash-lite')) {
            // Flash Lite模型预留较少空间
            multiplier = 1.8;
            estimatedTokens = parseInt(Math.min(thinkingBudget + estimatedTokens * multiplier, maxLimit));
        } else {
            // 其他模型保守预留
            multiplier = 1.5;
            estimatedTokens = parseInt(Math.min(thinkingBudget + estimatedTokens * multiplier, maxLimit));
        }
        console.log(`🧠 思考模式已启用，token预留倍数: ${multiplier}x (${originalTokens} → ${estimatedTokens})`);
    } else {
        // 未启用思考模式时，使用标准预留空间
        if (modelName.includes('gemini-2.5-pro')) {
            // Pro模型默认有动态思考，仍需预留一些空间
            multiplier = 1.5;
            estimatedTokens = parseInt(Math.min(estimatedTokens * multiplier, maxLimit));
        } else {
            // 其他模型无思考模式，预留较少空间
            multiplier = 1.2;
            estimatedTokens = parseInt(Math.min(estimatedTokens * multiplier, maxLimit));
        }
        console.log(`⚡ 思考模式未启用，标准token预留倍数: ${multiplier}x (${originalTokens} → ${estimatedTokens})`);
    }

    // 确保不超过模型限制
    return Math.min(estimatedTokens, maxLimit);

}

// 估算所需的Token数量
async function estimateRequiredTokens() {
    const { summaryLength, customLengthRange } = await chrome.storage.sync.get(['summaryLength', 'customLengthRange']);
    const selectedLength = summaryLength || 'medium';

    if (selectedLength === 'custom') {
        return estimateCustomLengthTokensFromSettings(customLengthRange);
    }

    // 预设长度的token估算（中文约2-3字符/token）
    const lengthTokenMap = {
        'short': 625,    // 150-250字 ≈ 300-500 tokens
        'medium': 1250,   // 300-500字 ≈ 600-1000 tokens
        'long': 2500     // 600-1000字 ≈ 1200-2000 tokens
    };

    return lengthTokenMap[selectedLength] || lengthTokenMap['medium'];
}

// 从设置估算自定义长度的Token数量
function estimateCustomLengthTokensFromSettings(customLengthRange) {
    if (!customLengthRange || !validateCustomLengthFormat(customLengthRange)) {
        return 1250; // 默认中等长度
    }

    // 解析自定义长度
    const numbers = customLengthRange.match(/\d+/g);
    if (!numbers) return 1250;

    let maxChars;
    if (numbers.length === 1) {
        maxChars = parseInt(numbers[0]);
    } else {
        maxChars = Math.max(...numbers.map(n => parseInt(n)));
    }

    // 中文字符转token的估算（约2.5字符/token）
    return Math.ceil(maxChars * 2.5) + 200; // 额外200token缓冲
}

// 从设置获取长度指令
function getLengthInstructionFromSettings(selectedLength, customLengthRange) {
    switch (selectedLength) {
        case 'short':
            return '3. 总结长度控制在150-250字，突出最核心的要点';
        case 'medium':
            return '3. 总结长度控制在300-500字，包含主要要点和细节';
        case 'long':
            return '3. 总结长度控制在600-1000字，提供详细分析和全面覆盖';
        case 'custom':
            return getCustomLengthInstructionFromSettings(customLengthRange);
        default:
            return '3. 总结长度控制在300-500字，包含主要要点和细节';
    }
}

// 从设置获取自定义长度指令
function getCustomLengthInstructionFromSettings(customLengthRange) {
    if (!customLengthRange || !validateCustomLengthFormat(customLengthRange)) {
        return '3. 总结长度控制在300-500字，包含主要要点和细节';
    }

    // 解析自定义长度
    const numbers = customLengthRange.match(/\d+/g);
    if (!numbers) {
        return '3. 总结长度控制在300-500字，包含主要要点和细节';
    }

    if (numbers.length === 1) {
        return `3. 总结长度控制在约${numbers[0]}字，保持内容精准`;
    } else {
        const min = Math.min(...numbers.map(n => parseInt(n)));
        const max = Math.max(...numbers.map(n => parseInt(n)));
        return `3. 总结长度控制在${min}-${max}字，根据内容复杂度调整详细程度`;
    }
}

// 验证自定义长度格式
function validateCustomLengthFormat(input) {
    // 支持格式: "200-400", "300", "150-250字"
    const patterns = [
        /^\d{2,4}-\d{2,4}$/,  // 200-400
        /^\d{2,4}$/,          // 300
        /^\d{2,4}-\d{2,4}字?$/ // 200-400字
    ];

    return patterns.some(pattern => pattern.test(input));
}

// 初始化扩展
async function initializeExtension() {
    console.log('初始化扩展...');

    // 加载保存的模型设置
    const { defaultModel } = await chrome.storage.sync.get(['defaultModel']);
    if (defaultModel && elements.quickModelSelect) {
        elements.quickModelSelect.value = defaultModel;
    }

    updateStatus('扩展已加载');
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM内容已加载，开始初始化...');
    
    try {
        // 初始化DOM元素
        initializeElements();
        
        // 初始化扩展
        await initializeExtension();
        
        // 设置事件监听器
        setupEventListeners();
        
        // 检查API密钥
        await checkApiKey();
        
        console.log('扩展初始化完成');
        
        // 添加全局测试函数
        window.testFixed = function() {
            console.log('=== 修复版测试 ===');
            console.log('DOM元素状态:', elements);
            
            // 测试设置按钮
            if (elements.settingsBtn) {
                console.log('模拟点击设置按钮...');
                elements.settingsBtn.click();
            }
            
            // 测试标签页切换
            console.log('测试标签页切换...');
            switchTab('flowchart');
            setTimeout(function() {
                switchTab('summary');
            }, 1000);
        };
        
        window.debugFixed = function() {
            return elements;
        };
        
    } catch (error) {
        console.error('初始化过程中发生错误:', error);
        updateStatus('初始化失败: ' + error.message);
    }
});

// 获取页面内容
async function getPageContent(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            function: extractPageContent
        });
        return results[0]?.result;
    } catch (error) {
        console.error('获取页面内容失败:', error);
        throw new Error('无法访问页面内容，请刷新页面后重试');
    }
}

// 提取页面内容的函数（在页面上下文中执行）
function extractPageContent() {
    // 移除脚本和样式标签
    const scripts = document.querySelectorAll('script, style, noscript');
    scripts.forEach(el => el.remove());

    // 获取主要内容
    const content = document.body.innerText || document.body.textContent || '';

    // 清理和限制内容长度
    const cleanContent = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim()
        .substring(0, 8000); // 限制长度避免API调用过大

    return {
        title: document.title,
        url: window.location.href,
        content: cleanContent
    };
}

// 生成总结
async function generateSummary(pageData) {
    const { geminiApiKey, defaultModel, summaryLength, customLengthRange, enableThinking, thinkingBudget } = await chrome.storage.sync.get([
        'geminiApiKey', 'defaultModel', 'summaryLength', 'customLengthRange', 'enableThinking', 'thinkingBudget'
    ]);
    const modelName = defaultModel || 'gemini-2.5-flash-lite-preview-06-17';

    // 根据设置中的长度配置调整提示词
    let lengthInstruction = getLengthInstructionFromSettings(summaryLength || 'medium', customLengthRange);

    // 为Pro模型提供更详细的指导
    const isProModel = modelName.includes('gemini-2.5-pro');
    const qualityInstruction = isProModel ?
        '5. 请进行深度分析，提供洞察和关联性思考\n6. 如有必要，可以包含推理过程和背景信息' :
        '5. 保持简洁明了，重点突出';

    const prompt = '请对以下网页内容进行智能总结，要求：\n' +
        '1. 提取核心要点和关键信息\n' +
        '2. 保持逻辑清晰，结构化呈现\n' +
        lengthInstruction + '\n' +
        '4. 使用中文回复\n' +
        qualityInstruction + '\n\n' +
        '网页标题：' + pageData.title + '\n' +
        '网页URL：' + pageData.url + '\n' +
        '网页内容：' + pageData.content;

    return await callGeminiAPI(geminiApiKey, prompt, modelName, { enableThinking, thinkingBudget });
}

// 生成流程图
async function generateFlowchart(pageData) {
    const { geminiApiKey, defaultModel, enableThinking, thinkingBudget } = await chrome.storage.sync.get([
        'geminiApiKey', 'defaultModel', 'enableThinking', 'thinkingBudget'
    ]);
    const modelName = defaultModel || 'gemini-2.5-flash-lite-preview-06-17';

    const prompt = `基于以下网页内容，生成一个Mermaid格式的流程图。

严格要求：
1. 必须以 "flowchart TD" 开头
2. 节点ID使用简单字母（A, B, C等）
3. 节点标签使用中文，用方括号包围
4. 决策节点使用花括号 {}
5. 连接线使用 -->
6. 条件标签使用 |条件|
7. 只返回纯Mermaid代码，不要任何解释
8. 不要使用代码块标记（\`\`\`）

标准格式示例：
flowchart TD
    A[开始] --> B[获取数据]
    B --> C{数据有效?}
    C -->|是| D[处理数据]
    C -->|否| E[显示错误]
    D --> F[保存结果]
    E --> G[结束]
    F --> G

网页标题：${pageData.title}
网页内容：${pageData.content.substring(0, 3000)}

请严格按照上述格式生成Mermaid流程图代码：`;

    const response = await callGeminiAPI(geminiApiKey, prompt, modelName, { enableThinking, thinkingBudget });

    console.log('API响应长度:', response?.length || 0);

    // 提取Mermaid代码
    let mermaidCode = response;

    // 尝试从代码块中提取
    const codeBlockMatch = response.match(/```(?:mermaid)?\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
        mermaidCode = codeBlockMatch[1];
    }

    // 清理代码
    mermaidCode = mermaidCode
        .replace(/^.*?flowchart/m, 'flowchart')
        .trim();

    // 验证Mermaid代码
    if (!mermaidCode || mermaidCode.length < 10) {
        throw new Error('生成的Mermaid代码无效或过短');
    }

    // 确保以flowchart开头
    if (!mermaidCode.startsWith('flowchart')) {
        mermaidCode = 'flowchart TD\n    ' + mermaidCode;
    }

    console.log('最终Mermaid代码:', mermaidCode);
    return mermaidCode;
}

// 调用Gemini API
async function callGeminiAPI(apiKey, prompt, modelName = 'gemini-2.5-flash-lite-preview-06-17', thinkingOptions = {}) {
    // 安全验证
    if (!validateApiKey(apiKey)) {
        throw new Error('无效的API密钥格式');
    }

    const safeModelName = validateModelName(modelName);
    const safePrompt = sanitizeInput(prompt);

    if (!safePrompt) {
        throw new Error('提示词内容无效');
    }

    // 安全修复：将API密钥放在请求头中，而不是URL中
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${safeModelName}:generateContent`;

    // 根据模型类型和内容长度智能配置生成参数
    const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95
    };

    // 智能计算maxOutputTokens
    const optimalTokens = await calculateOptimalTokens(safeModelName, prompt);
    generationConfig.maxOutputTokens = optimalTokens;

    // 根据Google官方文档和用户设置配置思考模式
    const { enableThinking = false, thinkingBudget = 1024 } = thinkingOptions;

    if (safeModelName.includes('gemini-2.5-pro')) {
        // Pro模型：无法禁用思考模式，但可以控制预算
        if (enableThinking && thinkingBudget > 0) {
            // 用户启用思考模式，使用指定预算（范围：128-32768）
            const budget = Math.max(128, Math.min(32768, thinkingBudget));
            generationConfig.thinkingConfig = {
                thinkingBudget: budget
            };
            console.log(`🧠 Pro模型已启用思考模式 (thinkingBudget: ${budget})`);
        } else {
            // 使用动态思考（Pro模型默认）
            generationConfig.thinkingConfig = {
                thinkingBudget: -1  // 动态思考：模型自动决定思考程度
            };
            console.log('🧠 Pro模型已启用动态思考模式 (thinkingBudget: -1)');
        }
    } else if (safeModelName.includes('gemini-2.5-flash-lite')) {
        // Flash Lite模型：默认不思考，但可以启用
        if (enableThinking && thinkingBudget > 0) {
            // 用户启用思考模式，使用指定预算（范围：512-24576）
            const budget = Math.max(512, Math.min(24576, thinkingBudget));
            generationConfig.thinkingConfig = {
                thinkingBudget: budget
            };
            console.log(`💡 Flash Lite模型已启用思考模式 (thinkingBudget: ${budget})`);
        } else if (enableThinking && thinkingBudget === 0) {
            // 用户选择动态思考
            generationConfig.thinkingConfig = {
                thinkingBudget: -1
            };
            console.log('💡 Flash Lite模型已启用动态思考模式 (thinkingBudget: -1)');
        } else {
            // 禁用思考模式
            generationConfig.thinkingConfig = {
                thinkingBudget: 0
            };
            console.log('💡 Flash Lite模型已禁用思考模式 (thinkingBudget: 0)');
        }
    } else if (safeModelName.includes('gemini-2.5-flash')) {
        // Flash模型：可以启用或禁用思考模式
        if (enableThinking && thinkingBudget > 0) {
            // 用户启用思考模式，使用指定预算（范围：0-24576）
            const budget = Math.max(0, Math.min(24576, thinkingBudget));
            generationConfig.thinkingConfig = {
                thinkingBudget: budget
            };
            console.log(`⚡ Flash模型已启用思考模式 (thinkingBudget: ${budget})`);
        } else if (enableThinking && thinkingBudget === 0) {
            // 用户选择动态思考
            generationConfig.thinkingConfig = {
                thinkingBudget: -1
            };
            console.log('⚡ Flash模型已启用动态思考模式 (thinkingBudget: -1)');
        } else {
            // 禁用思考模式
            generationConfig.thinkingConfig = {
                thinkingBudget: 0
            };
            console.log('⚡ Flash模型已禁用思考模式 (thinkingBudget: 0)');
        }
    } else {
        // 其他模型：使用保守设置
        generationConfig.thinkingConfig = {
            thinkingBudget: 0
        };
        console.log('🔧 其他模型已禁用思考模式 (thinkingBudget: 0)');
    }

    // 输出配置调试信息
    console.log('📊 API配置信息:', {
        model: safeModelName,
        maxOutputTokens: generationConfig.maxOutputTokens,
        thinkingBudget: generationConfig.thinkingConfig.thinkingBudget,
        temperature: generationConfig.temperature
    });

    const requestBody = {
        contents: [{
            parts: [{
                text: safePrompt
            }]
        }],
        generationConfig,
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey  // 安全修复：使用请求头传递API密钥
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error('API请求失败: ' + response.status + ' ' + response.statusText + ' - ' + JSON.stringify(errorData));
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('API返回数据格式错误：没有候选结果');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('API返回数据格式错误：没有内容部分');
    }

    // 检查是否因为长度限制而截断
    if (candidate.finishReason === 'MAX_TOKENS') {
        console.warn('⚠️ 响应因达到最大token限制而截断');
        updateStatus('⚠️ 响应可能不完整，已达到最大长度限制');
    } else if (candidate.finishReason === 'SAFETY') {
        console.warn('⚠️ 响应因安全过滤而截断');
        updateStatus('⚠️ 部分内容因安全策略被过滤');
    } else if (candidate.finishReason === 'RECITATION') {
        console.warn('⚠️ 响应因重复内容而截断');
        updateStatus('⚠️ 检测到重复内容，响应已调整');
    }

    return candidate.content.parts[0].text;
}

// 渲染Mermaid图表
async function renderChart(mermaidCode) {
    try {
        elements.mermaidChart.innerHTML = '';

        // 保存代码以便重试
        elements.mermaidChart.dataset.lastCode = mermaidCode;

        console.log('开始渲染Mermaid图表:', mermaidCode);

        // 清理和验证Mermaid代码
        const cleanCode = cleanMermaidCode(mermaidCode);
        console.log('清理后的Mermaid代码:', cleanCode);

        // 加载Mermaid库并渲染
        await loadAndRenderMermaid(cleanCode);

        // 添加交互功能
        setupChartInteractions();

        console.log('Mermaid图表渲染成功');

    } catch (error) {
        console.error('Mermaid渲染失败:', error);

        // 显示详细错误信息和重试选项
        elements.mermaidChart.innerHTML =
            '<div style="padding: 20px; text-align: center; color: #dc3545;">' +
            '<p>流程图渲染失败</p>' +
            '<p style="font-size: 12px; margin-top: 8px; color: #6c757d;">错误: ' + error.message + '</p>' +
            '<details style="margin-top: 10px; text-align: left;">' +
            '<summary style="cursor: pointer; color: #007bff;">查看生成的代码</summary>' +
            '<pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 11px; overflow-x: auto; margin-top: 5px;">' + mermaidCode + '</pre>' +
            '</details>' +
            '<div style="margin-top: 15px;">' +
            '<button onclick="retryFlowchart()" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px;">重新生成</button>' +
            '<button onclick="copyMermaidCode()" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">复制代码</button>' +
            '</div>' +
            '</div>';
        throw new Error('流程图渲染失败: ' + error.message);
    }
}

// 清理Mermaid代码
function cleanMermaidCode(code) {
    return code
        // 移除代码块标记
        .replace(/```mermaid\n?/g, '')
        .replace(/```\n?/g, '')
        // 移除多余的空行
        .replace(/\n\s*\n/g, '\n')
        // 确保以换行符结尾
        .trim()
        // 如果不是以flowchart开头，添加默认的flowchart TD
        .replace(/^(?!flowchart|graph)/m, 'flowchart TD\n    ');
}

// 加载并渲染Mermaid
async function loadAndRenderMermaid(mermaidCode) {
    console.log('使用本地渲染器渲染Mermaid代码');

    // 使用本地渲染器
    let svg;
    if (typeof window.renderMermaidLocally === 'function') {
        svg = window.renderMermaidLocally(mermaidCode);
    } else {
        // 备用简单渲染
        svg = createFallbackSVG(mermaidCode);
    }

    // 创建容器并插入SVG
    const container = document.createElement('div');
    container.className = 'mermaid-container';
    container.style.cssText = `
        position: relative;
        width: 100%;
        height: 400px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
        cursor: grab;
    `;

    const svgWrapper = document.createElement('div');
    svgWrapper.className = 'svg-wrapper';
    svgWrapper.style.cssText = `
        transform-origin: 0 0;
        transition: transform 0.1s ease-out;
        width: 100%;
        height: 100%;
    `;
    svgWrapper.innerHTML = svg;

    container.appendChild(svgWrapper);
    elements.mermaidChart.appendChild(container);

    // 重置缩放和位置
    currentZoom = 1;
    chartOffset = { x: 0, y: 0 };
}

// 备用SVG生成器
function createFallbackSVG(mermaidCode) {
    return `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="380" height="280" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2" rx="8"/>
        <text x="200" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#495057">
            流程图生成成功
        </text>
        <text x="200" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">
            Mermaid代码已生成，但渲染器正在加载中
        </text>
        <rect x="50" y="120" width="100" height="40" fill="#e1f5fe" stroke="#01579b" stroke-width="2" rx="5"/>
        <text x="100" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#01579b">开始</text>

        <line x1="150" y1="140" x2="200" y2="140" stroke="#424242" stroke-width="2" marker-end="url(#arrow)"/>

        <rect x="220" y="120" width="100" height="40" fill="#e1f5fe" stroke="#01579b" stroke-width="2" rx="5"/>
        <text x="270" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#01579b">处理</text>

        <line x1="270" y1="160" x2="270" y2="200" stroke="#424242" stroke-width="2" marker-end="url(#arrow)"/>

        <rect x="220" y="220" width="100" height="40" fill="#e8f5e8" stroke="#2e7d32" stroke-width="2" rx="5"/>
        <text x="270" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#2e7d32">结束</text>

        <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#424242"/>
            </marker>
        </defs>

        <text x="200" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#868e96">
            完整的流程图将在渲染器加载完成后显示
        </text>
    </svg>`;
}

// 安全函数：输入验证和清理
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';

    return input
        // 移除潜在的脚本标签
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // 移除javascript:协议
        .replace(/javascript:/gi, '')
        // 移除潜在的HTML标签
        .replace(/<[^>]*>/g, '')
        // 限制长度
        .substring(0, 10000)
        // 清理多余空白
        .trim();
}

// 安全函数：验证模型名称
function validateModelName(modelName) {
    const allowedModels = [
        'gemini-2.5-flash-lite-preview-06-17',
        'gemini-2.5-flash',
        'gemini-2.5-pro'
    ];
    return allowedModels.includes(modelName) ? modelName : 'gemini-2.5-flash-lite-preview-06-17';
}

// 安全函数：验证API密钥格式
function validateApiKey(apiKey) {
    if (typeof apiKey !== 'string') return false;
    // Google API密钥通常以AIza开头，长度约39字符
    return /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey);
}

// 错误分析函数
function analyzeError(error) {
    const errorMessage = error.message || error.toString();

    // API错误分析
    if (errorMessage.includes('400')) {
        if (errorMessage.includes('Budget is invalid')) {
            return {
                type: 'thinking_mode_error',
                message: '思考模式配置错误',
                details: 'Gemini 2.5 Pro模型需要启用思考模式',
                solution: '请切换到其他模型或联系开发者'
            };
        } else if (errorMessage.includes('Invalid argument')) {
            return {
                type: 'api_parameter_error',
                message: 'API参数错误',
                details: '请求参数不符合API规范',
                solution: '请重试或切换模型'
            };
        }
        return {
            type: 'bad_request',
            message: '请求格式错误',
            details: errorMessage,
            solution: '请检查输入内容并重试'
        };
    }

    if (errorMessage.includes('401') || errorMessage.includes('403')) {
        return {
            type: 'auth_error',
            message: 'API密钥无效',
            details: 'API密钥可能已过期或无效',
            solution: '请在设置中更新API密钥'
        };
    }

    if (errorMessage.includes('429')) {
        return {
            type: 'rate_limit',
            message: '请求频率过高',
            details: '已达到API调用限制',
            solution: '请稍后再试'
        };
    }

    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
        return {
            type: 'server_error',
            message: '服务器错误',
            details: 'Google API服务暂时不可用',
            solution: '请稍后重试'
        };
    }

    if (errorMessage.includes('网络') || errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return {
            type: 'network_error',
            message: '网络连接错误',
            details: '无法连接到Google API服务',
            solution: '请检查网络连接'
        };
    }

    if (errorMessage.includes('SAFETY') || errorMessage.includes('安全')) {
        return {
            type: 'safety_filter',
            message: '内容安全过滤',
            details: '内容被安全策略阻止',
            solution: '请修改输入内容后重试'
        };
    }

    // 默认错误
    return {
        type: 'unknown_error',
        message: '未知错误',
        details: errorMessage,
        solution: '请重试或联系技术支持'
    };
}

// 显示详细错误信息
function showDetailedError(title, errorInfo) {
    const errorHtml = `
        <div class="error-details">
            <h4>❌ ${title}</h4>
            <div class="error-info">
                <p><strong>错误类型:</strong> ${errorInfo.message}</p>
                <p><strong>详细信息:</strong> ${errorInfo.details}</p>
                <p><strong>解决方案:</strong> ${errorInfo.solution}</p>
            </div>
            <div class="error-actions">
                <button onclick="this.parentElement.parentElement.style.display='none'" class="error-close-btn">关闭</button>
            </div>
        </div>
    `;

    // 显示错误信息
    updateStatus(errorHtml);

    // 控制台输出详细错误信息
    console.group(`🚨 ${title}`);
    console.error('错误类型:', errorInfo.type);
    console.error('错误消息:', errorInfo.message);
    console.error('详细信息:', errorInfo.details);
    console.error('解决方案:', errorInfo.solution);
    console.groupEnd();
}

// 设置按钮加载状态
function setButtonLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// 格式化总结内容
function formatSummary(summary) {
    return summary
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// 显示错误消息
function showError(message) {
    if (elements.statusMessage) {
        elements.statusMessage.textContent = message;
        elements.statusMessage.style.color = '#dc3545';
        setTimeout(() => {
            elements.statusMessage.style.color = '#6c757d';
        }, 5000);
    }
}

// 设置图表交互功能
function setupChartInteractions() {
    const container = elements.mermaidChart.querySelector('.mermaid-container');
    const svgWrapper = elements.mermaidChart.querySelector('.svg-wrapper');

    if (!container || !svgWrapper) return;

    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };

    // 鼠标滚轮缩放
    container.addEventListener('wheel', (e) => {
        e.preventDefault();

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, currentZoom * zoomFactor));

        // 计算缩放中心点
        const zoomCenterX = (mouseX - chartOffset.x) / currentZoom;
        const zoomCenterY = (mouseY - chartOffset.y) / currentZoom;

        currentZoom = newZoom;

        // 调整偏移以保持鼠标位置为缩放中心
        chartOffset.x = mouseX - zoomCenterX * currentZoom;
        chartOffset.y = mouseY - zoomCenterY * currentZoom;

        updateChartTransform();
    });

    // 鼠标拖拽
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMousePos = { x: e.clientX, y: e.clientY };
        container.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;

        chartOffset.x += deltaX;
        chartOffset.y += deltaY;

        lastMousePos = { x: e.clientX, y: e.clientY };
        updateChartTransform();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            container.style.cursor = 'grab';
        }
    });

    // 触摸支持（移动设备）
    let lastTouchDistance = 0;

    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastTouchDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );
        }
        e.preventDefault();
    });

    container.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isDragging) {
            const deltaX = e.touches[0].clientX - lastMousePos.x;
            const deltaY = e.touches[0].clientY - lastMousePos.y;

            chartOffset.x += deltaX;
            chartOffset.y += deltaY;

            lastMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            updateChartTransform();
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.sqrt(
                Math.pow(touch2.clientX - touch1.clientX, 2) +
                Math.pow(touch2.clientY - touch1.clientY, 2)
            );

            if (lastTouchDistance > 0) {
                const zoomFactor = currentDistance / lastTouchDistance;
                currentZoom = Math.max(0.1, Math.min(3, currentZoom * zoomFactor));
                updateChartTransform();
            }

            lastTouchDistance = currentDistance;
        }
        e.preventDefault();
    });

    container.addEventListener('touchend', () => {
        isDragging = false;
        lastTouchDistance = 0;
    });
}

// 更新图表变换
function updateChartTransform() {
    const svgWrapper = elements.mermaidChart.querySelector('.svg-wrapper');
    if (svgWrapper) {
        svgWrapper.style.transform = `translate(${chartOffset.x}px, ${chartOffset.y}px) scale(${currentZoom})`;
    }
}

// 重置图表视图
function resetChartView() {
    currentZoom = 1;
    chartOffset = { x: 0, y: 0 };
    updateChartTransform();
}

// 重试流程图生成
function retryFlowchart() {
    if (elements.generateFlowchartBtn) {
        elements.generateFlowchartBtn.click();
    }
}

// 复制Mermaid代码
function copyMermaidCode() {
    const mermaidCode = elements.mermaidChart.dataset.lastCode;
    if (mermaidCode) {
        navigator.clipboard.writeText(mermaidCode).then(() => {
            updateStatus('Mermaid代码已复制到剪贴板');
        }).catch(() => {
            // 备用复制方法
            const textArea = document.createElement('textarea');
            textArea.value = mermaidCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            updateStatus('Mermaid代码已复制到剪贴板');
        });
    }
}

// 缩放图表
function zoomChart(factor) {
    currentZoom = Math.max(0.1, Math.min(3, currentZoom * factor));
    updateChartTransform();
}

// 下载图表
function downloadChart(format) {
    const svgElement = elements.mermaidChart.querySelector('svg');
    if (!svgElement) {
        updateStatus('没有可下载的图表');
        return;
    }

    if (format === 'svg') {
        downloadSVG(svgElement);
    } else if (format === 'png') {
        downloadPNG(svgElement);
    }
}

// 下载SVG
function downloadSVG(svgElement) {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    updateStatus('SVG图表已下载');
}

// 下载PNG
function downloadPNG(svgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svgElement);

    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flowchart.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            updateStatus('PNG图表已下载');
        });
    };

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
}

// 添加全局函数供HTML调用
window.retryFlowchart = retryFlowchart;
window.copyMermaidCode = copyMermaidCode;
window.resetChartView = resetChartView;
window.zoomChart = zoomChart;
window.downloadChart = downloadChart;

console.log('修复版popup.js加载完成');
