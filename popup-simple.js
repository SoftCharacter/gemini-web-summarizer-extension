/**
 * 简化版popup.js - 用于测试基本功能
 */

console.log('简化版popup.js开始加载...');

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...');
    
    // 获取DOM元素
    const elements = {
        tabButtons: document.querySelectorAll('.tab-button'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        settingsBtn: document.getElementById('settings-btn'),
        summarizeBtn: document.getElementById('summarize-btn'),
        generateFlowchartBtn: document.getElementById('generate-flowchart-btn'),
        statusMessage: document.getElementById('status-message'),
        apiKeyPrompt: document.getElementById('api-key-prompt')
    };
    
    console.log('DOM元素获取结果:', {
        tabButtons: elements.tabButtons.length,
        settingsBtn: !!elements.settingsBtn,
        generateFlowchartBtn: !!elements.generateFlowchartBtn
    });
    
    // 设置标签页切换
    if (elements.tabButtons.length > 0) {
        elements.tabButtons.forEach((button, index) => {
            console.log(`设置标签页按钮 ${index}:`, button.dataset.tab);
            button.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('标签页按钮被点击:', button.dataset.tab);
                switchTab(button.dataset.tab);
            });
        });
    }
    
    // 设置设置按钮
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('设置按钮被点击');
            openSettings();
        });
        console.log('设置按钮事件已绑定');
    } else {
        console.error('设置按钮未找到');
    }
    
    // 设置总结按钮
    if (elements.summarizeBtn) {
        elements.summarizeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('总结按钮被点击');
            updateStatus('总结功能暂时不可用');
        });
    }
    
    // 设置流程图按钮
    if (elements.generateFlowchartBtn) {
        elements.generateFlowchartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('流程图按钮被点击');
            updateStatus('流程图功能暂时不可用');
        });
    }
    
    // 隐藏API提示框
    if (elements.apiKeyPrompt) {
        elements.apiKeyPrompt.style.display = 'none';
    }
    
    // 更新状态
    updateStatus('扩展已加载 - 简化版');
    
    console.log('简化版初始化完成');
    
    // 切换标签页函数
    function switchTab(tabName) {
        console.log('切换到标签页:', tabName);
        
        try {
            // 移除所有active类
            elements.tabButtons.forEach(btn => btn.classList.remove('active'));
            elements.tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // 添加active类
            const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
            const activePane = document.getElementById(`${tabName}-tab`);
            
            if (activeButton) {
                activeButton.classList.add('active');
                console.log('按钮激活成功');
            }
            
            if (activePane) {
                activePane.classList.add('active');
                console.log('标签页激活成功');
            }
            
            updateStatus(`已切换到${tabName}标签页`);
            
        } catch (error) {
            console.error('切换标签页失败:', error);
        }
    }
    
    // 打开设置页面函数
    function openSettings() {
        console.log('尝试打开设置页面...');
        
        try {
            if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
                console.log('设置页面已打开');
                updateStatus('设置页面已打开');
            } else {
                console.error('chrome.runtime.openOptionsPage 不可用');
                updateStatus('无法打开设置页面');
            }
        } catch (error) {
            console.error('打开设置页面失败:', error);
            updateStatus('打开设置页面失败');
        }
    }
    
    // 更新状态消息函数
    function updateStatus(message) {
        console.log('状态更新:', message);
        if (elements.statusMessage) {
            elements.statusMessage.textContent = message;
        }
    }
    
    // 添加全局测试函数
    window.testSimple = function() {
        console.log('=== 简化版测试 ===');
        console.log('DOM元素状态:', elements);
        
        // 测试设置按钮
        if (elements.settingsBtn) {
            console.log('模拟点击设置按钮...');
            elements.settingsBtn.click();
        }
        
        // 测试标签页切换
        console.log('测试标签页切换...');
        switchTab('flowchart');
        setTimeout(() => switchTab('summary'), 1000);
    };
    
    window.forceOpenSettings = function() {
        console.log('强制打开设置页面...');
        chrome.runtime.openOptionsPage();
    };
});

console.log('简化版popup.js加载完成');
