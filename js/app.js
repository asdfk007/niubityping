/**
 * 打字练习应用
 */

// DOM元素
const elements = {
    originalText: document.getElementById('original-text'),
    inputText: document.getElementById('input-text'),
    timeDisplay: document.getElementById('time'),
    speedDisplay: document.getElementById('speed'),
    correctDisplay: document.getElementById('correct'),
    incorrectDisplay: document.getElementById('incorrect'),
    accuracyDisplay: document.getElementById('accuracy'),
    fileUpload: document.getElementById('file-upload'),
    chineseMode: document.getElementById('chinese-mode'),
    englishMode: document.getElementById('english-mode'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    endBtn: document.getElementById('end-btn'),
    modal: document.getElementById('result-modal'),
    closeModal: document.querySelector('.close'),
    tryAgainBtn: document.getElementById('try-again-btn'),
    totalChars: document.getElementById('total-chars'),
    totalTime: document.getElementById('total-time'),
    totalCorrect: document.getElementById('total-correct'),
    totalIncorrect: document.getElementById('total-incorrect'),
    finalSpeed: document.getElementById('final-speed'),
    finalAccuracy: document.getElementById('final-accuracy')
};

// 应用状态
const state = {
    currentMode: 'chinese', // 'chinese' 或 'english'
    originalText: '',
    startTime: null,
    timerId: null,
    isTyping: false,
    totalCorrectChars: 0,
    totalIncorrectChars: 0
};

// 示例文本
const sampleTexts = {
    chinese: `打字练习是提高键盘输入速度和准确性的有效方法。通过持续的练习，你可以逐渐提高打字速度，减少错误率。打字速度快的人在工作和学习中往往更有效率，可以更快地完成文档编辑、邮件回复等任务。希望这个打字练习软件能帮助你提高打字技能！`,
    english: `Typing practice is an effective way to improve keyboard input speed and accuracy. Through continuous practice, you can gradually increase your typing speed and reduce error rates. People who type quickly are often more efficient in work and study, and can complete tasks such as document editing and email replies faster. Hope this typing practice software helps you improve your typing skills!`
};

// 初始化应用
function init() {
    // 加载默认文本
    loadSampleText();
    
    // 事件监听器
    elements.inputText.addEventListener('input', handleInput);
    elements.fileUpload.addEventListener('change', handleFileUpload);
    elements.chineseMode.addEventListener('click', () => switchMode('chinese'));
    elements.englishMode.addEventListener('click', () => switchMode('english'));
    elements.startBtn.addEventListener('click', startTyping);
    elements.resetBtn.addEventListener('click', resetTyping);
    elements.endBtn.addEventListener('click', endTyping);
    elements.closeModal.addEventListener('click', () => elements.modal.style.display = 'none');
    elements.tryAgainBtn.addEventListener('click', () => {
        elements.modal.style.display = 'none';
        resetTyping();
    });
    
    // 点击窗口外关闭模态框
    window.addEventListener('click', (event) => {
        if (event.target === elements.modal) {
            elements.modal.style.display = 'none';
        }
    });
}

// 加载示例文本
function loadSampleText() {
    state.originalText = sampleTexts[state.currentMode];
    
    // 使用pre元素更新原文，保持原始格式
    elements.originalText.innerHTML = '';
    const preElement = document.createElement('pre');
    preElement.style.whiteSpace = 'pre-wrap';
    preElement.style.margin = '0';
    preElement.style.width = '100%';
    preElement.textContent = state.originalText;
    elements.originalText.appendChild(preElement);
    
    updateInputAreaHeight();
}

// 切换语言模式
function switchMode(mode) {
    if (state.currentMode === mode) return;
    
    state.currentMode = mode;
    
    // 更新UI
    if (mode === 'chinese') {
        elements.chineseMode.classList.add('active');
        elements.englishMode.classList.remove('active');
    } else {
        elements.chineseMode.classList.remove('active');
        elements.englishMode.classList.add('active');
    }
    
    // 重置并加载新文本
    resetTyping();
    loadSampleText();
}

// 处理文件上传
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // 尝试使用UTF-8解码
            state.originalText = e.target.result;
            
            // 确保文本末尾有换行符，防止不完整行的显示问题
            if (state.originalText.length > 0 && !state.originalText.endsWith('\n')) {
                state.originalText += '\n';
            }
            
            // 检查是否有乱码（常见中文乱码特征）
            if (/�/.test(state.originalText)) {
                // 如果有乱码，尝试使用GBK/GB18030编码重新读取
                const gbkReader = new FileReader();
                gbkReader.onload = function(e2) {
                    try {
                        // 使用TextDecoder解码
                        const decoder = new TextDecoder('gbk');
                        const buffer = new Uint8Array(e2.target.result);
                        state.originalText = decoder.decode(buffer);
                        
                        // 确保文本末尾有换行符
                        if (state.originalText.length > 0 && !state.originalText.endsWith('\n')) {
                            state.originalText += '\n';
                        }
                        
                        updateTextAndUI();
                    } catch (err) {
                        // 如果GBK解码失败，回退到原始UTF-8结果
                        console.warn('GBK解码失败，使用原始UTF-8结果');
                        updateTextAndUI();
                    }
                };
                gbkReader.onerror = function() {
                    updateTextAndUI();
                };
                gbkReader.readAsArrayBuffer(file);
            } else {
                // 没有明显乱码，直接使用UTF-8结果
                updateTextAndUI();
            }
        } catch (err) {
            console.error('文件读取错误:', err);
            alert('文件读取出错，请尝试其他文件');
        }
    };
    
    reader.onerror = function() {
        alert('无法读取文件，请重试');
    };
    
    // 首先尝试UTF-8编码
    reader.readAsText(file, 'UTF-8');
    
    // 辅助函数：更新文本和UI
    function updateTextAndUI() {
        // 使用pre元素更新原文，保持原始格式
        elements.originalText.innerHTML = '';
        const preElement = document.createElement('pre');
        preElement.style.whiteSpace = 'pre-wrap';
        preElement.style.margin = '0';
        preElement.style.width = '100%';
        preElement.textContent = state.originalText;
        elements.originalText.appendChild(preElement);
        
        updateInputAreaHeight();
        resetTyping();
        // 设置滚动位置回到顶部
        elements.originalText.scrollTop = 0;
    }
}

// 开始打字
function startTyping() {
    if (state.isTyping) return;
    
    elements.inputText.value = '';
    elements.inputText.focus();
    resetStats();
    state.isTyping = true;
}

// 处理输入
function handleInput() {
    // 如果是第一次输入，开始计时
    if (!state.startTime && elements.inputText.value.length > 0) {
        state.startTime = Date.now();
        startTimer();
    }
    
    // 对比原文和输入文本
    compareTexts();
    
    // 更新统计数据
    updateStats();
}

// 比较原文和输入文本
function compareTexts() {
    const originalText = state.originalText;
    const inputText = elements.inputText.value;
    
    let correctChars = 0;
    let incorrectChars = 0;
    
    // 记录当前输入位置，用于自动滚动
    let currentPosition = Math.min(inputText.length, originalText.length) - 1;
    
    // 将原文转换为DOM节点，保持换行结构
    const textContainer = document.createElement('div');
    
    // 逐字符处理
    for (let i = 0; i < originalText.length; i++) {
        const char = originalText[i];
        const span = document.createElement('span');
        
        // 处理换行符特殊显示
        if (char === '\n' || char === '\r') {
            // 显示一个特殊符号表示换行
            span.innerHTML = '<span class="newline-symbol">⏎</span><br>';
            span.className = 'newline';
        } else {
            span.textContent = char;
        }
        
        // 根据用户输入确定样式
        if (i < inputText.length) {
            // 特殊处理换行符比较
            if ((char === '\n' || char === '\r') && 
                (inputText[i] === '\n' || inputText[i] === '\r')) {
                span.classList.add('correct');
                correctChars++;
            } else if (inputText[i] === char) {
                span.classList.add('correct');
                correctChars++;
            } else {
                span.classList.add('incorrect');
                incorrectChars++;
            }
        }
        
        // 当前字符是最新输入位置的下一个字符时，添加一个当前位置标记
        if (i === currentPosition + 1) {
            span.classList.add('current-position');
        }
        
        // 添加到容器
        textContainer.appendChild(span);
    }
    
    // 清空并重新填充原文区域
    elements.originalText.innerHTML = '';
    elements.originalText.appendChild(textContainer);
    
    // 更新总计数
    state.totalCorrectChars = correctChars;
    state.totalIncorrectChars = incorrectChars;
    
    // 自动滚动到当前输入位置
    if (currentPosition >= 0) {
        scrollToCurrentPosition(currentPosition);
    }
}

// 转义HTML特殊字符以防止XSS攻击
function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/<//g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 保留原文中的换行符
function preserveNewlines(text) {
    return text.replace(/\n/g, "<br>");
}

// 滚动到当前输入位置
function scrollToCurrentPosition(position) {
    if (position < 0) return;
    
    // 获取所有已渲染的字符元素
    const spans = elements.originalText.querySelectorAll('span');
    
    // 确保有足够的元素可以滚动到
    if (spans.length > 0 && position < spans.length) {
        const targetElement = spans[position];
        
        // 获取滚动容器
        const container = elements.originalText;
        
        // 目标元素的位置信息
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // 计算元素顶部相对于容器的位置
        const relativeTop = targetRect.top - containerRect.top;
        
        // 计算元素底部相对于容器的位置
        const relativeBottom = relativeTop + targetRect.height;
        
        // 检查元素是否在可视区域内，加入更严格的判断条件
        const isInView = (
            relativeTop >= 0 &&
            relativeBottom <= containerRect.height &&
            relativeTop <= containerRect.height * 0.7  // 确保目标在视图的上半部分
        );
        
        // 如果元素不在理想的可视区域，进行滚动
        if (!isInView) {
            // 计算新的滚动位置，让当前字符位于容器的三分之一处（更靠上一些）
            const newScrollTop = container.scrollTop + relativeTop - (containerRect.height / 3);
            
            // 立即滚动到目标位置，避免平滑滚动造成的延迟
            container.scrollTop = newScrollTop;
        }
    }
}

// 开始计时器
function startTimer() {
    state.timerId = setInterval(updateTimer, 1000);
    updateTimer(); // 立即更新一次
}

// 更新计时器显示
function updateTimer() {
    if (!state.startTime) return;
    
    const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    
    elements.timeDisplay.textContent = `${minutes}:${seconds}`;
    
    // 更新打字速度（字符/分钟）
    updateTypingSpeed(elapsedTime);
}

// 更新打字速度
function updateTypingSpeed(elapsedTime) {
    if (elapsedTime === 0) return;
    
    const inputLength = elements.inputText.value.length;
    const minutesElapsed = elapsedTime / 60;
    const speed = Math.round(inputLength / minutesElapsed);
    
    elements.speedDisplay.textContent = `${speed} 字/分`;
}

// 更新统计数据
function updateStats() {
    elements.correctDisplay.textContent = state.totalCorrectChars;
    elements.incorrectDisplay.textContent = state.totalIncorrectChars;
    
    const totalChars = state.totalCorrectChars + state.totalIncorrectChars;
    const accuracy = totalChars > 0 
        ? Math.round((state.totalCorrectChars / totalChars) * 100) 
        : 0;
    
    elements.accuracyDisplay.textContent = `${accuracy}%`;
}

// 重置打字
function resetTyping() {
    // 停止计时器
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
    
    // 重置状态
    state.startTime = null;
    state.isTyping = false;
    state.totalCorrectChars = 0;
    state.totalIncorrectChars = 0;
    
    // 清空输入
    elements.inputText.value = '';
    
    // 恢复原文显示，使用pre元素保持格式
    elements.originalText.innerHTML = '';
    const preElement = document.createElement('pre');
    preElement.style.whiteSpace = 'pre-wrap';
    preElement.style.margin = '0';
    preElement.style.width = '100%';
    preElement.textContent = state.originalText;
    elements.originalText.appendChild(preElement);
    
    // 重置统计
    resetStats();
}

// 重置统计数据
function resetStats() {
    elements.timeDisplay.textContent = '00:00';
    elements.speedDisplay.textContent = '0 字/分';
    elements.correctDisplay.textContent = '0';
    elements.incorrectDisplay.textContent = '0';
    elements.accuracyDisplay.textContent = '0%';
}

// 结束打字
function endTyping() {
    // 如果没有输入任何内容，则不执行结束操作
    if (elements.inputText.value.length === 0) return;
    
    // 如果没有开始计时，但有输入内容，则设置开始时间为当前时间
    if (!state.startTime && elements.inputText.value.length > 0) {
        state.startTime = Date.now();
    }
    
    // 停止计时器
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
    
    // 计算最终结果
    const elapsedTime = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    const totalChars = elements.inputText.value.length;
    const minutesElapsed = elapsedTime / 60 || 0.01; // 避免除以零
    const speed = Math.round(totalChars / minutesElapsed);
    
    // 如果还没有比较过文本，先比较一次
    if (state.totalCorrectChars === 0 && state.totalIncorrectChars === 0) {
        compareTexts();
    }
    
    const accuracy = totalChars > 0 
        ? Math.round((state.totalCorrectChars / totalChars) * 100) 
        : 0;
    
    // 更新结果模态框
    elements.totalChars.textContent = totalChars;
    elements.totalTime.textContent = `${minutes}:${seconds}`;
    elements.totalCorrect.textContent = state.totalCorrectChars;
    elements.totalIncorrect.textContent = state.totalIncorrectChars;
    elements.finalSpeed.textContent = `${speed} 字/分`;
    elements.finalAccuracy.textContent = `${accuracy}%`;
    
    // 显示结果模态框
    elements.modal.style.display = 'flex';
    
    // 重置状态
    state.isTyping = false;
}

// 更新输入区域高度
function updateInputAreaHeight() {
    const originalTextHeight = elements.originalText.scrollHeight;
    elements.inputText.style.height = `${originalTextHeight}px`;
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init);