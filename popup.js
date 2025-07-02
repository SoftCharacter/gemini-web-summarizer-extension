// 全局变量
let currentZoom = 1;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let chartOffset = { x: 0, y: 0 };

// DOM元素 - 将在DOM加载完成后初始化
let elements = {};

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
        zoomInBtn: document.getElementById('zoom-in-btn'),
        zoomOutBtn: document.getElementById('zoom-out-btn'),
        resetZoomBtn: document.getElementById('reset-zoom-btn'),
        downloadPngBtn: document.getElementById('download-png-btn'),
        downloadSvgBtn: document.getElementById('download-svg-btn'),
        // 快速设置
        quickModelSelect: document.getElementById('quick-model-select'),
        quickLengthSelect: document.getElementById('quick-length-select')
    };

    // 详细验证每个关键元素
    const elementStatus = {
        tabButtons: elements.tabButtons.length,
        settingsBtn: !!elements.settingsBtn,
        generateFlowchartBtn: !!elements.generateFlowchartBtn,
        summarizeBtn: !!elements.summarizeBtn,
        statusMessage: !!elements.statusMessage,
        quickModelSelect: !!elements.quickModelSelect,
        quickLengthSelect: !!elements.quickLengthSelect
    };

    console.log('DOM元素初始化完成:', elementStatus);

    // 检查缺失的元素
    Object.entries(elementStatus).forEach(([key, value]) => {
        if (!value || (typeof value === 'number' && value === 0)) {
            console.warn(`元素缺失或未找到: ${key}`);
        }
    });

    // 添加全局调试函数
    window.debugElements = () => {
        console.log('当前DOM元素状态:', elements);
        return elements;
    };
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM内容已加载，开始初始化...');

    // 初始化DOM元素
    initializeElements();

    // 初始化扩展
    await initializeExtension();

    // 设置事件监听器
    setupEventListeners();

    // 加载快速设置
    await loadQuickSettings();

    // 检查API密钥
    checkApiKey();

    console.log('扩展初始化完成');

    // 添加全局测试函数
    window.testClick = function() {
        console.log('测试点击功能...');
        if (elements.settingsBtn) {
            console.log('设置按钮存在，模拟点击');
            elements.settingsBtn.click();
        } else {
            console.log('设置按钮不存在');
        }
    };

    window.testTabSwitch = function(tabName) {
        console.log('测试标签页切换:', tabName);
        switchTab(tabName || 'flowchart');
    };

    window.hideApiPrompt = function() {
        console.log('强制隐藏API提示框');
        if (elements.apiKeyPrompt) {
            elements.apiKeyPrompt.style.display = 'none';
            console.log('API提示框已隐藏');
        } else {
            console.log('API提示框元素未找到');
        }
    };

    window.showApiPrompt = function() {
        console.log('显示API提示框');
        if (elements.apiKeyPrompt) {
            elements.apiKeyPrompt.style.display = 'flex';
            console.log('API提示框已显示');
        } else {
            console.log('API提示框元素未找到');
        }
    };
});

// 初始化扩展
async function initializeExtension() {
    updateStatus('扩展已加载');

    // 加载Mermaid库
    try {
        await loadMermaid();
        updateStatus('图表库已加载');
    } catch (error) {
        console.error('加载图表库失败:', error);
        updateStatus('图表库加载失败，流程图功能可能不可用');
    }
}

// 设置事件监听器
function setupEventListeners() {
    console.log('开始设置事件监听器...');

    try {
        // 标签页切换
        if (elements.tabButtons && elements.tabButtons.length > 0) {
            elements.tabButtons.forEach((button, index) => {
                console.log(`设置标签页按钮 ${index} 事件监听器:`, button.dataset.tab);
                button.addEventListener('click', (e) => {
                    console.log('标签页按钮被点击:', button.dataset.tab);
                    switchTab(button.dataset.tab);
                });
            });
        } else {
            console.error('标签页按钮未找到');
        }

        // 主要功能按钮
        if (elements.summarizeBtn) {
            elements.summarizeBtn.addEventListener('click', handleSummarize);
            console.log('总结按钮事件监听器已设置');
        } else {
            console.error('总结按钮未找到');
        }

        if (elements.generateFlowchartBtn) {
            elements.generateFlowchartBtn.addEventListener('click', handleGenerateFlowchart);
            console.log('流程图按钮事件监听器已设置');
        } else {
            console.error('流程图按钮未找到');
        }

        if (elements.copySummaryBtn) {
            elements.copySummaryBtn.addEventListener('click', handleCopySummary);
            console.log('复制按钮事件监听器已设置');
        }

        // 设置按钮
        if (elements.settingsBtn) {
            elements.settingsBtn.addEventListener('click', (e) => {
                console.log('设置按钮被点击');
                openSettings();
            });
            console.log('设置按钮事件监听器已设置');
        } else {
            console.error('设置按钮未找到');
        }

        if (elements.openSettingsBtn) {
            elements.openSettingsBtn.addEventListener('click', openSettings);
            console.log('打开设置按钮事件监听器已设置');
        }

        // 图表控制按钮
        if (elements.zoomInBtn) {
            elements.zoomInBtn.addEventListener('click', () => zoomChart(1.2));
        }
        if (elements.zoomOutBtn) {
            elements.zoomOutBtn.addEventListener('click', () => zoomChart(0.8));
        }
        if (elements.resetZoomBtn) {
            elements.resetZoomBtn.addEventListener('click', resetChart);
        }
        if (elements.downloadPngBtn) {
            elements.downloadPngBtn.addEventListener('click', () => downloadChart('png'));
        }
        if (elements.downloadSvgBtn) {
            elements.downloadSvgBtn.addEventListener('click', () => downloadChart('svg'));
        }

        // 图表拖拽功能
        setupChartDragging();

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
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            console.log('按钮激活成功:', tabName);
        } else {
            console.error('未找到标签页按钮:', tabName);
        }

        // 激活选中的标签页内容
        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) {
            activeTab.classList.add('active');
            console.log('标签页内容激活成功:', tabName);
        } else {
            console.error('未找到标签页内容:', `${tabName}-tab`);
        }

    } catch (error) {
        console.error('切换标签页时发生错误:', error);
    }
}

// 检查API密钥
async function checkApiKey() {
    console.log('开始检查API密钥...');

    try {
        const result = await chrome.storage.sync.get(['geminiApiKey']);
        console.log('API密钥检查结果:', result);

        if (!result.geminiApiKey || result.geminiApiKey.trim() === '') {
            console.log('API密钥未设置，显示提示框');
            if (elements.apiKeyPrompt) {
                elements.apiKeyPrompt.style.display = 'flex';
                console.log('API密钥提示框已显示');
            } else {
                console.error('API密钥提示框元素未找到');
            }
            updateStatus('请设置Gemini API密钥');
            return false;
        } else {
            console.log('API密钥已设置，隐藏提示框');
            if (elements.apiKeyPrompt) {
                elements.apiKeyPrompt.style.display = 'none';
                console.log('API密钥提示框已隐藏');
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
        updateStatus(`总结失败: ${error.message}`);
        showError('总结失败，请检查网络连接和API密钥设置');
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
        updateStatus(`流程图生成失败: ${error.message}`);
        showError('流程图生成失败，请检查网络连接和API密钥设置');
    } finally {
        setButtonLoading(elements.generateFlowchartBtn, false);
    }
}

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
    const { geminiApiKey } = await chrome.storage.sync.get(['geminiApiKey']);
    const settings = await getCurrentSettings();

    // 获取提示词模板
    const promptTemplate = await getSummaryPromptTemplate(settings);

    // 处理提示词变量
    const prompt = processPromptTemplate(promptTemplate, {
        title: pageData.title,
        url: pageData.url,
        content: pageData.content,
        length: getLengthDescription(settings.summaryLength)
    });

    // 构建API选项
    const apiOptions = {
        temperature: settings.temperature,
        maxOutputTokens: settings.maxTokens
    };

    // 如果启用思考模式
    if (settings.enableThinking) {
        apiOptions.thinkingBudget = settings.thinkingBudget;
    } else {
        apiOptions.thinkingBudget = 0;
    }

    try {
        return await callGeminiAPIWithModel(geminiApiKey, prompt, settings.model, apiOptions);
    } catch (error) {
        console.error('总结API调用失败:', error);
        throw new Error(`总结生成失败: ${error.message}`);
    }
}

// 生成流程图
async function generateFlowchart(pageData) {
    const { geminiApiKey } = await chrome.storage.sync.get(['geminiApiKey']);
    const settings = await getCurrentSettings();

    // 获取提示词模板
    const promptTemplate = await getFlowchartPromptTemplate(settings);

    // 处理提示词变量
    const prompt = processPromptTemplate(promptTemplate, {
        title: pageData.title,
        content: pageData.content
    });

    // 构建API选项
    const apiOptions = {
        temperature: settings.temperature,
        maxOutputTokens: settings.maxTokens
    };

    // 如果启用思考模式
    if (settings.enableThinking) {
        apiOptions.thinkingBudget = settings.thinkingBudget;
    } else {
        apiOptions.thinkingBudget = 0;
    }

    try {
        const response = await callGeminiAPIWithModel(geminiApiKey, prompt, settings.model, apiOptions);

        if (!response || response.trim().length === 0) {
            throw new Error('API返回空响应');
        }

        console.log('流程图API响应:', response);

        // 提取Mermaid代码
        const mermaidMatch = response.match(/```mermaid\n([\s\S]*?)\n```/) ||
                            response.match(/```\n([\s\S]*?)\n```/) ||
                            [null, response];

        const mermaidCode = mermaidMatch[1] || response;

        // 验证Mermaid代码
        if (!mermaidCode || mermaidCode.trim().length === 0) {
            throw new Error('无法提取有效的Mermaid代码');
        }

        console.log('提取的Mermaid代码:', mermaidCode);
        return mermaidCode.trim();

    } catch (error) {
        console.error('流程图生成API调用失败:', error);
        throw new Error(`流程图生成失败: ${error.message}`);
    }
}

// 复制总结内容
async function handleCopySummary() {
    try {
        const summaryText = elements.summaryContent.innerText;
        await navigator.clipboard.writeText(summaryText);
        updateStatus('总结内容已复制到剪贴板');
        
        // 临时改变按钮文本
        const originalText = elements.copySummaryBtn.textContent;
        elements.copySummaryBtn.textContent = '✅';
        setTimeout(() => {
            elements.copySummaryBtn.textContent = originalText;
        }, 1000);
    } catch (error) {
        console.error('复制失败:', error);
        updateStatus('复制失败');
    }
}

// 设置按钮加载状态
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

// 更新状态消息
function updateStatus(message) {
    elements.statusMessage.textContent = message;
}

// 显示错误消息
function showError(message) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.style.color = '#dc3545';
    setTimeout(() => {
        elements.statusMessage.style.color = '#6c757d';
    }, 5000);
}

// 格式化总结内容
function formatSummary(summary) {
    return summary
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// 打开设置页面
function openSettings() {
    console.log('尝试打开设置页面...');

    try {
        if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
            console.log('设置页面打开成功');
        } else {
            console.error('chrome.runtime.openOptionsPage 不可用');
            // 备用方案：尝试直接打开设置页面
            const settingsUrl = chrome.runtime.getURL('options.html');
            window.open(settingsUrl, '_blank');
        }
    } catch (error) {
        console.error('打开设置页面失败:', error);
        updateStatus('打开设置页面失败');
    }
}

// 加载快速设置
async function loadQuickSettings() {
    try {
        const result = await chrome.storage.sync.get(['defaultModel', 'summaryLength']);

        if (result.defaultModel) {
            elements.quickModelSelect.value = result.defaultModel;
        }

        if (result.summaryLength) {
            elements.quickLengthSelect.value = result.summaryLength;
        }

        // 添加快速设置变更监听
        elements.quickModelSelect.addEventListener('change', saveQuickSettings);
        elements.quickLengthSelect.addEventListener('change', saveQuickSettings);

    } catch (error) {
        console.error('加载快速设置失败:', error);
    }
}

// 保存快速设置
async function saveQuickSettings() {
    try {
        await chrome.storage.sync.set({
            defaultModel: elements.quickModelSelect.value,
            summaryLength: elements.quickLengthSelect.value
        });

        updateStatus('设置已保存');
    } catch (error) {
        console.error('保存快速设置失败:', error);
    }
}

// 获取当前设置
async function getCurrentSettings() {
    try {
        const result = await chrome.storage.sync.get([
            'defaultModel', 'summaryLength', 'apiTemperature', 'maxTokens',
            'enableThinking', 'thinkingBudget', 'summaryPromptTemplate',
            'customSummaryPrompt', 'flowchartPromptTemplate', 'customFlowchartPrompt'
        ]);

        return {
            model: result.defaultModel || 'gemini-2.5-flash',
            summaryLength: result.summaryLength || 'medium',
            temperature: result.apiTemperature || 0.7,
            maxTokens: result.maxTokens || 2048,
            enableThinking: result.enableThinking || false,
            thinkingBudget: result.thinkingBudget || 10000,
            summaryPromptTemplate: result.summaryPromptTemplate || 'default',
            customSummaryPrompt: result.customSummaryPrompt || '',
            flowchartPromptTemplate: result.flowchartPromptTemplate || 'default',
            customFlowchartPrompt: result.customFlowchartPrompt || ''
        };
    } catch (error) {
        console.error('获取设置失败:', error);
        return {
            model: 'gemini-2.5-flash',
            summaryLength: 'medium',
            temperature: 0.7,
            maxTokens: 2048,
            enableThinking: false,
            thinkingBudget: 10000,
            summaryPromptTemplate: 'default',
            customSummaryPrompt: '',
            flowchartPromptTemplate: 'default',
            customFlowchartPrompt: ''
        };
    }
}

// 获取总结提示词模板
async function getSummaryPromptTemplate(settings) {
    if (settings.summaryPromptTemplate === 'custom' && settings.customSummaryPrompt) {
        return settings.customSummaryPrompt;
    }

    // 默认模板
    const templates = {
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
    };

    return templates[settings.summaryPromptTemplate] || templates.default;
}

// 获取流程图提示词模板
async function getFlowchartPromptTemplate(settings) {
    if (settings.flowchartPromptTemplate === 'custom' && settings.customFlowchartPrompt) {
        return settings.customFlowchartPrompt;
    }

    // 默认模板
    const templates = {
        default: `基于以下网页内容，生成一个Mermaid格式的流程图。

要求：
1. 使用 flowchart TD 语法开头
2. 节点名称使用中文，保持简洁
3. 使用 --> 连接节点
4. 只返回纯Mermaid代码，不要任何解释文字
5. 不要使用代码块标记

示例格式：
flowchart TD
    A[开始] --> B[步骤1]
    B --> C{判断条件}
    C -->|是| D[步骤2]
    C -->|否| E[步骤3]
    D --> F[结束]
    E --> F

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
    };

    return templates[settings.flowchartPromptTemplate] || templates.default;
}

// 处理提示词模板变量
function processPromptTemplate(template, data) {
    return template
        .replace(/\{title\}/g, data.title || '')
        .replace(/\{url\}/g, data.url || '')
        .replace(/\{content\}/g, data.content || '')
        .replace(/\{length\}/g, data.length || '中等长度');
}

// 获取长度描述
function getLengthDescription(length) {
    const descriptions = {
        short: '100-200字的简短总结',
        medium: '300-500字的中等长度总结',
        long: '500-800字的详细总结'
    };
    return descriptions[length] || descriptions.medium;
}

// 使用指定模型调用Gemini API
async function callGeminiAPIWithModel(apiKey, prompt, model, options = {}) {
    // 检查API函数是否可用
    if (typeof window.callGeminiAPI !== 'function') {
        console.error('callGeminiAPI函数未找到，尝试直接调用API');
        return await directApiCall(apiKey, prompt, model, options);
    }

    // 临时更新URL
    const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
        return await window.callGeminiAPI(apiKey, prompt, {
            ...options,
            _modelUrl: modelUrl
        });
    } catch (error) {
        console.error(`使用模型 ${model} 调用API失败:`, error);
        // 如果window.callGeminiAPI失败，尝试直接调用
        console.log('尝试直接API调用...');
        return await directApiCall(apiKey, prompt, model, options);
    }
}

// 直接API调用作为备用方案
async function directApiCall(apiKey, prompt, model, options = {}) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 2048,
            stopSequences: options.stopSequences || [],
            thinkingConfig: {
                thinkingBudget: options.thinkingBudget !== undefined ? options.thinkingBudget : 0
            }
        },
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
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('API返回数据格式错误：没有候选结果');
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('API返回数据格式错误：没有内容部分');
    }

    return candidate.content.parts[0].text;
}

// 重试渲染图表
function retryRenderChart() {
    const lastMermaidCode = elements.mermaidChart.dataset.lastCode;
    if (lastMermaidCode) {
        renderChart(lastMermaidCode);
    }
}

// 渲染Mermaid图表
async function renderChart(mermaidCode) {
    try {
        elements.mermaidChart.innerHTML = '';

        // 保存代码以便重试
        elements.mermaidChart.dataset.lastCode = mermaidCode;

        console.log('开始渲染Mermaid图表:', mermaidCode);

        // 检查Mermaid库是否加载
        if (typeof window.renderMermaidChart !== 'function') {
            console.log('Mermaid渲染函数未找到，尝试直接渲染');
            await directMermaidRender(mermaidCode);
        } else {
            // 使用全局的渲染函数
            await window.renderMermaidChart(mermaidCode, 'mermaid-chart');
        }

        // 重置图表状态
        currentZoom = 1;
        chartOffset = { x: 0, y: 0 };
        updateChartTransform();

        console.log('Mermaid图表渲染成功');

    } catch (error) {
        console.error('Mermaid渲染失败:', error);

        // 显示详细错误信息
        elements.mermaidChart.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #dc3545;">
                <p>流程图渲染失败</p>
                <p style="font-size: 12px; margin-top: 8px; color: #6c757d;">错误: ${error.message}</p>
                <details style="margin-top: 10px; text-align: left;">
                    <summary style="cursor: pointer; color: #007bff;">查看Mermaid代码</summary>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 11px; overflow-x: auto; margin-top: 5px;">${mermaidCode}</pre>
                </details>
                <div style="margin-top: 15px;">
                    <button onclick="retryRenderChart()" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">重试</button>
                    <button onclick="copyMermaidCode()" style="padding: 5px 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">复制代码</button>
                </div>
            </div>
        `;
        throw new Error(`流程图渲染失败: ${error.message}`);
    }
}

// 直接Mermaid渲染（备用方案）
async function directMermaidRender(mermaidCode) {
    // 如果Mermaid库未加载，先加载
    if (typeof mermaid === 'undefined') {
        await loadMermaidDirect();
    }

    // 生成唯一ID
    const chartId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 渲染图表
    const { svg } = await mermaid.render(chartId, mermaidCode);

    // 将SVG插入到指定元素
    elements.mermaidChart.innerHTML = svg;
}

// 直接加载Mermaid库
async function loadMermaidDirect() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js';
        script.onload = () => {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose'
            });
            console.log('Mermaid库直接加载成功');
            resolve();
        };
        script.onerror = () => {
            reject(new Error('无法加载Mermaid库'));
        };
        document.head.appendChild(script);
    });
}

// 复制Mermaid代码
function copyMermaidCode() {
    const mermaidCode = elements.mermaidChart.dataset.lastCode;
    if (mermaidCode) {
        navigator.clipboard.writeText(mermaidCode).then(() => {
            updateStatus('Mermaid代码已复制到剪贴板');
        }).catch(() => {
            updateStatus('复制失败');
        });
    }
}

// 图表缩放功能
function zoomChart(factor) {
    currentZoom *= factor;
    currentZoom = Math.max(0.5, Math.min(3, currentZoom)); // 限制缩放范围
    updateChartTransform();
}

// 重置图表
function resetChart() {
    currentZoom = 1;
    chartOffset = { x: 0, y: 0 };
    updateChartTransform();
}

// 更新图表变换
function updateChartTransform() {
    const svg = elements.mermaidChart.querySelector('svg');
    if (svg) {
        svg.style.transform = `translate(${chartOffset.x}px, ${chartOffset.y}px) scale(${currentZoom})`;
        svg.style.transformOrigin = 'center center';
    }
}

// 设置图表拖拽功能
function setupChartDragging() {
    elements.mermaidChart.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStart.x = e.clientX - chartOffset.x;
        dragStart.y = e.clientY - chartOffset.y;
        elements.mermaidChart.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        chartOffset.x = e.clientX - dragStart.x;
        chartOffset.y = e.clientY - dragStart.y;
        updateChartTransform();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        elements.mermaidChart.style.cursor = 'grab';
    });

    // 鼠标滚轮缩放
    elements.mermaidChart.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        zoomChart(zoomFactor);
    });
}

// 下载图表
async function downloadChart(format) {
    try {
        const svg = elements.mermaidChart.querySelector('svg');
        if (!svg) {
            throw new Error('没有可下载的图表');
        }

        if (format === 'svg') {
            downloadSVG(svg);
        } else if (format === 'png') {
            await downloadPNG(svg);
        }

        updateStatus(`图表已下载为${format.toUpperCase()}格式`);
    } catch (error) {
        console.error('下载失败:', error);
        updateStatus('下载失败');
    }
}

// 下载SVG
function downloadSVG(svg) {
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 下载PNG
async function downloadPNG(svg) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'flowchart.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                resolve();
            });
        };

        img.onerror = reject;

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        img.src = url;
    });
}
