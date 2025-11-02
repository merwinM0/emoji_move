// main.ts

import StaticEmoji from './moveEmoji';

const emojis: Record<string, string> = {
    "happy": "ᵔᴥᵔ",
    "sad": "‾᷄ᗣ‾᷅",
    "nervious": "•﹏•",
    "default": "･◡･",
    "shock": "ㅇㅅㅇ"
};




// ------------------- 全局交互逻辑 -------------------

let emojiInstance: StaticEmoji;
const MESSAGES = {
    initial: '请登录',
    usernameFocus: '请输入账号 (mo)',
    passwordFocus: '请输入密码 (123456)',
    loginSuccess: '🎉 登录成功!',
    loginFail: '❌ 密码错误！请重试',
};
const messageEl = document.getElementById('message') as HTMLDivElement;

// 全局鼠标移动处理函数 (在 body 标签中调用)
(window as any).handleMouseMove = (e: MouseEvent) => {
    if (emojiInstance) {
        emojiInstance.updateMousePosition(e.clientX, e.clientY); 
    }
};

// 全局鼠标离开页面处理函数 (在 body 标签中调用)
(window as any).handleMouseLeave = () => {
     if (emojiInstance && !emojiInstance.getIsSadState()) {
        emojiInstance.setState({ expression: 'nervious' }); // 使用 nervous 表情
        // 特征组回到中心 (0,0)
        const canvasRect = emojiInstance.canvas.getBoundingClientRect();
        const targetX = canvasRect.left + emojiInstance.fixedCenterX;
        const targetY = canvasRect.top + emojiInstance.fixedCenterY;
        emojiInstance.updateMousePosition(targetX, targetY);
      }
};

// 聚焦输入框处理函数
(window as any).handleInputFocus = (field: 'username' | 'password') => {
    if (emojiInstance && !emojiInstance.getIsSadState()) {
        if (field === 'username') {
            emojiInstance.setState({ expression: 'default' });
            messageEl.textContent = MESSAGES.usernameFocus;
        } else {
            emojiInstance.setState({ expression: 'shock' });
            messageEl.textContent = MESSAGES.passwordFocus;
        }
    }
};

// 失去焦点处理函数
(window as any).handleInputBlur = () => {
    if (emojiInstance && !emojiInstance.getIsSadState()) {
        emojiInstance.setState({ expression: 'default' });
        messageEl.textContent = MESSAGES.initial;
    }
};


// 登录处理函数
(window as any).handleLogin = () => {
    const usernameEl = document.getElementById('username') as HTMLInputElement;
    const passwordEl = document.getElementById('password') as HTMLInputElement;
    
    const correctUsername = 'mo';
    const correctPassword = '123456';

    if (usernameEl.value === correctUsername && passwordEl.value === correctPassword) {
        // 登录成功：表情改为 'happy'
        emojiInstance.setState({ expression: 'happy' });
        messageEl.className = 'text-center h-6 text-sm text-green-600 font-bold';
        messageEl.textContent = MESSAGES.loginSuccess;



    } else {
        // 密码错误：表情改为 'sad'
        // 保持第二个参数 true 来标记错误状态（isSadState），以便鼠标移动时重置表情
        emojiInstance.setState({ expression: 'sad' }, true);
        messageEl.className = 'text-center h-6 text-sm text-red-600 font-bold';
        messageEl.textContent = MESSAGES.loginFail;
    }
};


// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    try {
        emojiInstance = new StaticEmoji('emojiCanvas', emojis);
        messageEl.textContent = MESSAGES.initial;
        
        // 初始化特征组位置到中心 (0,0)
        const canvasRect = emojiInstance.canvas.getBoundingClientRect();
        const initialTargetX = canvasRect.left + emojiInstance.fixedCenterX;
        const initialTargetY = canvasRect.top + emojiInstance.fixedCenterY; 
        emojiInstance.updateMousePosition(initialTargetX, initialTargetY);

    } catch (e) {
        console.error(e);
        messageEl.textContent = 'Canvas 初始化失败';
    }
});
