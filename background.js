/**
 * 后台脚本 - Service Worker
 * 处理扩展的后台逻辑和消息传递
 */

// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Gemini Web Summarizer 扩展已安装');
    
    if (details.reason === 'install') {
        // 首次安装时打开设置页面
        chrome.runtime.openOptionsPage();
        
        // 设置默认配置
        chrome.storage.sync.set({
            'extensionEnabled': true,
            'autoSummarize': false,
            'summaryLength': 'medium',
            'language': 'zh-CN'
        });
    }
});

// 监听来自popup和content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getPageContent':
            handleGetPageContent(request, sender, sendResponse);
            break;
        case 'validateApiKey':
            handleValidateApiKey(request, sender, sendResponse);
            break;
        case 'saveSettings':
            handleSaveSettings(request, sender, sendResponse);
            break;
        case 'getSettings':
            handleGetSettings(request, sender, sendResponse);
            break;
        default:
            console.warn('未知的消息类型:', request.action);
    }
    
    // 返回true表示异步响应
    return true;
});

/**
 * 处理获取页面内容的请求
 */
async function handleGetPageContent(request, sender, sendResponse) {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error('无法获取当前标签页');
        }
        
        // 检查是否可以在该页面执行脚本
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
            throw new Error('无法在系统页面中提取内容');
        }
        
        // 向content script发送消息获取页面内容
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
        
        if (response.success) {
            sendResponse({ success: true, data: response.data });
        } else {
            throw new Error(response.error || '提取页面内容失败');
        }
        
    } catch (error) {
        console.error('获取页面内容失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

/**
 * 处理API密钥验证请求
 */
async function handleValidateApiKey(request, sender, sendResponse) {
    try {
        const { apiKey } = request;
        
        if (!apiKey) {
            throw new Error('API密钥不能为空');
        }
        
        // 调用Gemini API进行验证
        const isValid = await validateGeminiApiKey(apiKey);
        
        sendResponse({ success: true, isValid });
        
    } catch (error) {
        console.error('API密钥验证失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

/**
 * 处理保存设置请求
 */
async function handleSaveSettings(request, sender, sendResponse) {
    try {
        const { settings } = request;
        
        // 保存设置到Chrome存储
        await chrome.storage.sync.set(settings);
        
        sendResponse({ success: true });
        
    } catch (error) {
        console.error('保存设置失败:', error);
        sendResponse({ success: false, error: error.message });
    }
}

/**
 * 处理获取设置请求
 */
async function handleGetSettings(request, sender, sendResponse) {
    try {
        const settings = await chrome.storage.sync.get([
            'geminiApiKey',
            'extensionEnabled',
            'autoSummarize',
            'summaryLength',
            'language'
        ]);
        
        sendResponse({ success: true, settings });
        
    } catch (error) {
        console.error('获取设置失败:', error);
        sendResponse({ success: false, error: error.message });
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
            return data.candidates && data.candidates.length > 0;
        }

        // 记录详细的错误信息
        const errorData = await response.json().catch(() => ({}));
        console.error('API验证失败:', response.status, response.statusText, errorData);

        return false;

    } catch (error) {
        console.error('API密钥验证请求失败:', error);
        return false;
    }
}

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // 当页面加载完成时
    if (changeInfo.status === 'complete' && tab.url) {
        // 检查是否启用了自动总结功能
        const settings = await chrome.storage.sync.get(['autoSummarize', 'extensionEnabled']);
        
        if (settings.extensionEnabled && settings.autoSummarize) {
            // 可以在这里实现自动总结功能
            console.log('页面加载完成，可以执行自动总结:', tab.url);
        }
    }
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
    // 这个事件在有popup的情况下不会触发
    // 但可以作为备用处理逻辑
    console.log('扩展图标被点击:', tab.url);
});

// 监听存储变化事件
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log('存储设置已更改:', changes);
    
    // 可以在这里处理设置变化的逻辑
    if (changes.extensionEnabled) {
        console.log('扩展启用状态已更改:', changes.extensionEnabled.newValue);
    }
    
    if (changes.geminiApiKey) {
        console.log('API密钥已更新');
    }
});

// 处理扩展卸载事件
chrome.runtime.onSuspend.addListener(() => {
    console.log('Gemini Web Summarizer 扩展即将被挂起');
});

// 错误处理
chrome.runtime.onStartup.addListener(() => {
    console.log('Gemini Web Summarizer 扩展已启动');
});

// 监听来自其他扩展的外部消息（如果需要）
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    console.log('收到外部消息:', request, sender);
    
    // 可以在这里处理来自其他扩展的消息
    sendResponse({ success: false, message: '不支持外部消息' });
});

/**
 * 工具函数：获取当前活跃标签页
 */
async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

/**
 * 工具函数：检查URL是否可以注入脚本
 */
function canInjectScript(url) {
    const restrictedProtocols = ['chrome:', 'chrome-extension:', 'edge:', 'about:', 'moz-extension:'];
    return !restrictedProtocols.some(protocol => url.startsWith(protocol));
}

/**
 * 工具函数：记录使用统计
 */
async function logUsageStats(action) {
    try {
        const stats = await chrome.storage.local.get(['usageStats']) || { usageStats: {} };
        const today = new Date().toDateString();
        
        if (!stats.usageStats[today]) {
            stats.usageStats[today] = {};
        }
        
        if (!stats.usageStats[today][action]) {
            stats.usageStats[today][action] = 0;
        }
        
        stats.usageStats[today][action]++;
        
        await chrome.storage.local.set({ usageStats: stats.usageStats });
        
    } catch (error) {
        console.error('记录使用统计失败:', error);
    }
}
