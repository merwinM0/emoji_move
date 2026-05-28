import StaticEmoji from './moveEmoji';

const emojis: Record<string, string> = {
    "happy": "ᵔᴥᵔ",
    "sad": "‾᷄ᗣ‾᷅",
    "nervous": "•﹏•",
    "default": "･◡･",
    "shock": "ㅇㅅㅇ"
};

let emojiInstance: StaticEmoji;

document.addEventListener('DOMContentLoaded', () => {
    try {
        //在这里提交canvas标签的id，并提供自定义的表情
        emojiInstance = new StaticEmoji('emojiCanvas', emojis);

        const canvasRect = emojiInstance.canvas.getBoundingClientRect();
        const initialTargetX = canvasRect.left + emojiInstance.fixedCenterX;
        const initialTargetY = canvasRect.top + emojiInstance.fixedCenterY;
        emojiInstance.updateMousePosition(initialTargetX, initialTargetY);

    } catch (e) {
        console.error(e);
    }
});


// 全局鼠标移动处理函数 (在 body 标签中调用)，必须要有一个这样的函数来监听页面
//onmousemove="handleMouseMove(event) 
(window as any).handleMouseMove = (e: MouseEvent) => {
    if (emojiInstance) {
        emojiInstance.updateMousePosition(e.clientX, e.clientY); 
    }
};

//定义表情位置：emojiInstance.updateMousePosition(x,y)
//定义表情：emojiInstance.setState({ expression :"这里是自定义表情的键"})


//推荐添加的函数（适合直接在html通过onclick ="函数"调用）：

// 设置表情处理函数
(window as any).setExpression = (expression: string) => {
    if (emojiInstance) {
        emojiInstance.setState({ expression });
    }
};


// 更新鼠标位置处理函数
(window as any).updateMousePosition = () => {
    const xEl = document.getElementById('mouseX') as HTMLInputElement;
    const yEl = document.getElementById('mouseY') as HTMLInputElement;
    const x = parseFloat(xEl.value);
    const y = parseFloat(yEl.value);
    if (!isNaN(x) && !isNaN(y) && emojiInstance) {
        emojiInstance.updateMousePosition(x, y);
    }
};


// 重置到中心处理函数
(window as any).resetToCenter = () => {
    if (emojiInstance) {
        const canvasRect = emojiInstance.canvas.getBoundingClientRect();
        const centerX = canvasRect.left + emojiInstance.fixedCenterX;
        const centerY = canvasRect.top + emojiInstance.fixedCenterY;
        emojiInstance.updateMousePosition(centerX, centerY);
    }
};


// 全局鼠标离开页面处理函数 (在 body 标签中调用)
//onmouseleave="handleMouseLeave()" 
(window as any).handleMouseLeave = () => {
     if (emojiInstance && !emojiInstance.getIsDefaultState()) {
        emojiInstance.setState({ expression: 'nervous' }); // 使用 nervous 表情
        // 特征组回到中心 (0,0)
        const canvasRect = emojiInstance.canvas.getBoundingClientRect();
        const targetX = canvasRect.left + emojiInstance.fixedCenterX;
        const targetY = canvasRect.top + emojiInstance.fixedCenterY;
        emojiInstance.updateMousePosition(targetX, targetY);
      }
};



