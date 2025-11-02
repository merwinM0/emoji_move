# emoji_move

一个交互式的表情符号应用，使用 HTML5 Canvas 绘制可随鼠标移动变形的表情符号。支持多种表情切换和手动位置控制。

An interactive emoji application that uses HTML5 Canvas to draw emojis that deform based on mouse movement. Supports multiple expression changes and manual position control.

## 功能特性 (Features)

- **表情切换**: 通过按钮或 API 设置不同表情（happy, sad, nervous, default, shock）。
- **鼠标跟踪**: 表情会根据鼠标位置动态变形。
- **手动控制**: 可通过输入框设置精确的鼠标位置。
- **重置功能**: 一键重置表情到中心位置。

## 安装 (Installation)

下载依赖 (To install dependencies):

```bash
bun install
```

## 运行 (Running)

运行应用 (To run the application):

```bash
bun run s
```
## 使用说明 (Usage)

### 测试界面操作 (TEST UI Controls)

- **表情按钮**: 点击 "Happy"、"Sad"、"Nervous"、"Default"、"Shock" 按钮切换表情。
- **位置输入**: 在 "Mouse X Position" 和 "Mouse Y Position" 输入框中输入坐标，然后点击 "Update Mouse Position" 更新表情位置。
- **重置**: 点击 "Reset to Center" 将表情重置到画布中心。

### API 使用 (API Usage)

项目提供了全局函数供外部调用（基于 `main.ts`）：

- **`setExpression(expression: string)`**: 设置表情。参数为表情键，如 `'happy'`、`'sad'` 等。
  ```javascript
  setExpression('happy'); // 设置为开心表情
  ```

- **`updateMousePosition()`**: 根据输入框的值更新鼠标位置。
  ```javascript
  updateMousePosition(); // 更新位置
  ```

- **`resetToCenter()`**: 重置表情到画布中心。
  ```javascript
  resetToCenter(); // 重置到中心
  ```

- **`handleMouseMove(event)`**: 处理鼠标移动事件（已在 HTML 中绑定）。
- **`handleMouseLeave()`**: 处理鼠标离开页面事件（已在 HTML 中绑定）。

### 自定义表情 (Custom Emojis)

在 `main.ts` 中修改 `emojis` 对象添加新表情：

```typescript
const emojis: Record<string, string> = {
    "happy": "ᵔᴥᵔ",
    "sad": "‾᷄ᗣ‾᷅",
    "nervous": "•﹏•",
    "default": "･◡･",
    "shock": "ㅇㅅㅇ",
    "custom": "😊" // 添加自定义表情
};
```

然后在 HTML 中添加对应按钮：`<button onclick="setExpression('custom')">Custom</button>`

## 项目结构 (Project Structure)

- `src/index.html`: 主页面，包含 Canvas 和控制界面，用于测试和提供参考。
- `src/main.ts`: 主逻辑，初始化表情实例和全局函数。
- `src/moveEmoji.ts`: 表情类，处理绘制和变形逻辑。

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
