/**
 * 内容脚本 - 在网页中运行，负责提取页面内容
 */

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractContent') {
        try {
            const content = extractPageContent();
            sendResponse({ success: true, data: content });
        } catch (error) {
            console.error('提取页面内容失败:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    
    // 返回true表示异步响应
    return true;
});

/**
 * 提取页面主要内容
 * @returns {Object} 页面内容对象
 */
function extractPageContent() {
    // 获取页面基本信息
    const pageInfo = {
        title: document.title || '',
        url: window.location.href,
        domain: window.location.hostname,
        timestamp: new Date().toISOString()
    };
    
    // 尝试提取主要内容
    let mainContent = '';
    
    // 方法1: 尝试从常见的主内容容器中提取
    const mainSelectors = [
        'main',
        '[role="main"]',
        '.main-content',
        '.content',
        '.post-content',
        '.article-content',
        '.entry-content',
        '#content',
        '#main-content',
        '.container .content'
    ];
    
    for (const selector of mainSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            mainContent = extractTextFromElement(element);
            if (mainContent.length > 500) { // 如果内容足够长，使用这个
                break;
            }
        }
    }
    
    // 方法2: 如果主内容提取失败，尝试从article标签提取
    if (mainContent.length < 500) {
        const articles = document.querySelectorAll('article');
        for (const article of articles) {
            const articleContent = extractTextFromElement(article);
            if (articleContent.length > mainContent.length) {
                mainContent = articleContent;
            }
        }
    }
    
    // 方法3: 如果仍然没有足够内容，从body提取但排除导航和侧边栏
    if (mainContent.length < 500) {
        mainContent = extractTextFromBody();
    }
    
    // 清理和格式化内容
    mainContent = cleanContent(mainContent);
    
    // 提取页面结构信息
    const structure = analyzePageStructure();
    
    // 提取关键元数据
    const metadata = extractMetadata();
    
    return {
        ...pageInfo,
        content: mainContent,
        structure: structure,
        metadata: metadata,
        wordCount: countWords(mainContent),
        language: detectLanguage()
    };
}

/**
 * 从元素中提取文本内容
 * @param {Element} element - DOM元素
 * @returns {string} 提取的文本
 */
function extractTextFromElement(element) {
    if (!element) return '';
    
    // 克隆元素以避免修改原始DOM
    const clone = element.cloneNode(true);
    
    // 移除不需要的元素
    const unwantedSelectors = [
        'script', 'style', 'noscript', 'iframe',
        '.advertisement', '.ads', '.sidebar',
        '.navigation', '.nav', '.menu',
        '.footer', '.header', '.comments',
        '.social-share', '.related-posts'
    ];
    
    unwantedSelectors.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    // 获取文本内容
    return clone.innerText || clone.textContent || '';
}

/**
 * 从body中提取内容，排除导航等元素
 * @returns {string} 提取的文本
 */
function extractTextFromBody() {
    const body = document.body.cloneNode(true);
    
    // 移除不需要的元素
    const unwantedSelectors = [
        'script', 'style', 'noscript', 'iframe',
        'header', 'nav', 'aside', 'footer',
        '.header', '.navigation', '.nav', '.menu',
        '.sidebar', '.aside', '.footer',
        '.advertisement', '.ads', '.banner',
        '.social-media', '.social-share',
        '.comments', '.comment-section',
        '.related-posts', '.recommended'
    ];
    
    unwantedSelectors.forEach(selector => {
        const elements = body.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    
    return body.innerText || body.textContent || '';
}

/**
 * 清理和格式化内容
 * @param {string} content - 原始内容
 * @returns {string} 清理后的内容
 */
function cleanContent(content) {
    return content
        // 移除多余的空白字符
        .replace(/\s+/g, ' ')
        // 移除多余的换行符
        .replace(/\n+/g, '\n')
        // 移除首尾空白
        .trim()
        // 限制内容长度（避免API调用过大）
        .substring(0, 10000);
}

/**
 * 分析页面结构
 * @returns {Object} 页面结构信息
 */
function analyzePageStructure() {
    const headings = [];
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach((heading, index) => {
        if (index < 20) { // 限制标题数量
            headings.push({
                level: parseInt(heading.tagName.charAt(1)),
                text: heading.textContent.trim(),
                id: heading.id || null
            });
        }
    });
    
    const lists = document.querySelectorAll('ul, ol').length;
    const tables = document.querySelectorAll('table').length;
    const images = document.querySelectorAll('img').length;
    const links = document.querySelectorAll('a').length;
    
    return {
        headings,
        lists,
        tables,
        images,
        links,
        hasForm: document.querySelectorAll('form').length > 0
    };
}

/**
 * 提取页面元数据
 * @returns {Object} 元数据信息
 */
function extractMetadata() {
    const metadata = {};
    
    // 提取meta标签信息
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        
        if (name && content) {
            // 只保留有用的meta信息
            if (['description', 'keywords', 'author', 'og:title', 'og:description', 'twitter:title', 'twitter:description'].includes(name)) {
                metadata[name] = content;
            }
        }
    });
    
    // 提取canonical链接
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
        metadata.canonical = canonical.href;
    }
    
    // 提取发布时间
    const timeElements = document.querySelectorAll('time[datetime], .published, .date, .post-date');
    if (timeElements.length > 0) {
        const timeElement = timeElements[0];
        metadata.publishTime = timeElement.getAttribute('datetime') || timeElement.textContent.trim();
    }
    
    return metadata;
}

/**
 * 统计单词数量
 * @param {string} text - 文本内容
 * @returns {number} 单词数量
 */
function countWords(text) {
    if (!text) return 0;
    
    // 对于中文，按字符计算
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    if (chineseChars && chineseChars.length > text.length * 0.3) {
        return text.length;
    }
    
    // 对于英文，按单词计算
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * 检测页面语言
 * @returns {string} 语言代码
 */
function detectLanguage() {
    // 首先检查html标签的lang属性
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
        return htmlLang;
    }
    
    // 检查meta标签
    const metaLang = document.querySelector('meta[http-equiv="content-language"]');
    if (metaLang) {
        return metaLang.getAttribute('content');
    }
    
    // 简单的语言检测
    const text = document.body.textContent || '';
    const chineseChars = text.match(/[\u4e00-\u9fff]/g);
    const englishChars = text.match(/[a-zA-Z]/g);
    
    if (chineseChars && chineseChars.length > (englishChars?.length || 0)) {
        return 'zh-CN';
    }
    
    return 'en';
}

// 页面加载完成后的初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

function initialize() {
    // 可以在这里添加页面加载完成后的初始化逻辑
    console.log('Gemini Web Summarizer content script loaded');
}
