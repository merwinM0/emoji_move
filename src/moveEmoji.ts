interface EmojiState {
    color: string; // 保留 color 属性，但将其设置为固定值
    expression?: string;
}

class StaticEmoji {
    public canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private emojiSize: number = 200;
    private halfSize: number; // r
    private emojis: Record<string, string>;

    // 颜色配置
    private faceColor: string = '#FFD700'; // 固定脸部颜色
    private pupilColor: string = '#000000';
    private mouthColor: string = '#000000';

    // 鼠标在页面上的位置
    private mouseX: number = 0;
    private mouseY: number = 0;

    // Canvas 上的固定中心点 (脸的底线中心 O(0,0))
    public fixedCenterX: number;
    public fixedCenterY: number;
    private centerShiftY: number = -15; // 脸中心向上移动的量

    // 脸中心在页面上的实际坐标（用于计算全局位置）
    private globalX: number = 0;
    private globalY: number = 0;

    // 特征组 C1 (眼睛+嘴巴) 的圆心 (C_move) 相对 O(0,0) 的偏移量
    private featureOffsetX: number = 0;
    private featureOffsetY: number = 0;

    // C1 圆的半径
    private featureGroupRadius: number; // R_C1
    // C1 圆心最大移动半径 (C_move 到圆弧的最大距离)
    private maxMovementRadius: number; // r - R_C1

    public currentState: EmojiState = {
        color: this.faceColor, // 使用固定的 faceColor
        expression: 'default'
    };

    private isSadState: boolean = false;

    public getIsSadState(): boolean {
        return this.isSadState;
    }

    constructor(canvasId: string, emojis: Record<string, string>) {
        this.emojis = emojis;
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D rendering context for Canvas.');
        }
        this.ctx = ctx;

        this.fixedCenterX = this.canvas.width / 2;
        this.fixedCenterY = this.canvas.height / 2 + this.centerShiftY;

        this.halfSize = this.emojiSize / 2; // r = 100

        // C1 半径 R_C1: 脸半径的 1/4
        this.featureGroupRadius = this.halfSize / 4; // R_C1 = 25

        // C1 圆心最大移动半径：r - R_C1 = 100 - 25 = 75
        this.maxMovementRadius = this.halfSize - this.featureGroupRadius;

        this.updateGlobalPosition();
        window.addEventListener('resize', this.updateGlobalPosition.bind(this));
        window.addEventListener('scroll', this.updateGlobalPosition.bind(this));

        this.animate();
    }

    /** 实时更新表情中心点的全局坐标 */
    private updateGlobalPosition() {
        const rect = this.canvas.getBoundingClientRect();
        this.globalX = rect.left + this.fixedCenterX;
        this.globalY = rect.top + this.fixedCenterY;
    }

    /** 供全局事件调用的方法：更新鼠标位置，并计算特征组的新偏移量 */
    public updateMousePosition(x: number, y: number) {
        this.mouseX = x;
        this.mouseY = y;

        // C1 圆心 (C_move) 相对脸底线中心 O(0,0) 的位置
        const dx = this.mouseX - this.globalX;
        const dy = this.mouseY - this.globalY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        // 约束 1: 确保 C_move 在圆 r 的范围内
        let constrainedDx = dx;
        let constrainedDy = dy;
        if (distance > this.halfSize) {
            const ratio = this.halfSize / distance;
            constrainedDx = dx * ratio;
            constrainedDy = dy * ratio;
        }

        // 约束 2: 确保 C1 不超出半圆弧 (即 C_move 离圆弧至少 R_C1 远)
        // C_move 距离圆心 O 的距离必须 <= r - R_C1 (maxMovementRadius)
        const finalDistance = Math.sqrt(constrainedDx * constrainedDx + constrainedDy * constrainedDy);

        if (finalDistance > this.maxMovementRadius) {
             const ratio = this.maxMovementRadius / finalDistance;
             this.featureOffsetX = constrainedDx * ratio;
             this.featureOffsetY = constrainedDy * ratio;
        } else {
             this.featureOffsetX = constrainedDx;
             this.featureOffsetY = constrainedDy;
        }

        // 约束 3: 确保 C1 位于 Y=0 (底线) 上方
        // C_move 的 Y 坐标 + R_C1 必须小于 0
        if (this.featureOffsetY + this.featureGroupRadius > 0) {
            this.featureOffsetY = -this.featureGroupRadius;
        }

        if (this.isSadState) {
            // isSadState 为 true 时，重置为 default 状态 (不改变颜色)
            this.setState({ expression: 'default' }, false);
            this.isSadState = false;
        }
    }

    public setState(newState: Partial<EmojiState>, isSad: boolean = false) {
        // 覆盖传入的 color 属性，始终使用固定的 faceColor，从而去除颜色变化
        this.currentState = {
            ...this.currentState,
            ...newState,
            color: this.faceColor // 强制使用固定颜色
        };
        this.isSadState = isSad;
    }

    // ------------------- 绘图逻辑 -------------------

    private drawEmoji() {
        const { ctx, emojiSize, currentState } = this;
        const r = this.halfSize;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(this.fixedCenterX, this.fixedCenterY);

        // 绘制脸部 (形变)
        this.drawFace(ctx, r, this.faceColor); // 使用固定颜色 this.faceColor

        // 2. 绘制表情字符串
        ctx.save();
        // 坐标原点平移到 C1 圆心 (C_move)
        ctx.translate(this.featureOffsetX, this.featureOffsetY);

        const mouthY = r * 0.05; // 嘴巴位置
        const emojiStr = this.emojis[currentState.expression || 'default']!;
        ctx.fillStyle = this.mouthColor;
        ctx.font = `${r * 0.2}px Arial`; // 调整字体大小
        ctx.textAlign = 'center';
        ctx.fillText(emojiStr, 0, mouthY);

        ctx.restore();

        ctx.restore();
    }

    // 脸部形变逻辑重构
    private drawFace(ctx: CanvasRenderingContext2D, r: number, color: string) {
        // C_move 相对 O(0,0) 的位置
        const { featureOffsetX, featureOffsetY } = this;

        // 形变强度基于 C_move 到 O(0,0) 的距离
        const dist = Math.sqrt(featureOffsetX * featureOffsetX + featureOffsetY * featureOffsetY);
        const maxDist = this.maxMovementRadius;
        const strength = Math.min(1, dist / maxDist);

        // 形变参数
        // 垂直挤压/拉伸 (Y-Bulge): 当 C_move 靠近顶部时 Y 拉伸，靠近底线时 Y 挤压
        // C_move 初始位置在 Y 轴负方向，所以 Y 越小 (越向上)，-featureOffsetY 越大
        const Y_movement = -featureOffsetY;
        const max_Y_movement = r;

        // 归一化 Y 轴驱动因子
        const y_driver = Math.min(1, Math.max(-1, Y_movement / max_Y_movement));

        // 垂直形变：当 y_driver > 0 (向上) 时，Y-Apex 向上拉伸；当 y_driver < 0 (向下) 时，Y-Apex 向下挤压
        const bulgeY = r * 0.06 * y_driver * strength; // 最大 5% 的垂直形变

        // 水平形变 (X-Squish/Stretch): 只有当 C_move 在 X 轴有移动时
        let bulgeX = 0;
        if (dist > 1) {
           const x_driver = featureOffsetX / dist; // -1 to 1
           // 水平形变：在 X 方向拉伸，并在 Y 方向挤压
           bulgeX = r * 0.15* x_driver * strength;
        }

        // --- 绘制半圆轮廓 ---

        if (strength < 0.01) {
             // 绘制标准半圆
            ctx.beginPath();
            ctx.moveTo(-r, 0);
            ctx.lineTo(r, 0);
            ctx.arc(0, 0, r, 0, Math.PI, true);
            ctx.closePath();
        } else {
            // 使用贝塞尔曲线实现平滑形变

            // 贝塞尔曲线圆弧近似系数 (k ≈ 0.5519)
            const k = 0.5519;
            const rk = r * k;

            // m4: Apex point (弧线顶点的动态位置)
            const APEX_X = bulgeX;
            const APEX_Y = -r + bulgeY * 1.5; // Y 形变主要影响 APEX Y 坐标

            ctx.beginPath();

            // m1, m2: 位于底线 Y=0 上的 ±r/2 处，用于形变参考
            const m_pos = r / 2;

            // m2: 右底点 (r, 0)
            ctx.moveTo(r, 0);
            // m1: 左底点 (-r, 0)
            ctx.lineTo(-r, 0); // 绘制底线

            // --- Segment 1: 左底 m1(-r, 0) 到 Apex ---

            // C1 (左中控制点)
            const c1x = -r;
            const c1y = -rk - bulgeY * 0.5; // 垂直形变

            // C2 (左上控制点)
            const c2x = -rk + bulgeX * 0.8;
            const c2y = -r + bulgeY * 1.0;

            ctx.bezierCurveTo(
                c1x, c1y, // C1 (靠近左底)
                c2x, c2y, // C2 (靠近 Apex)
                APEX_X, APEX_Y // 终点 (m4/Apex)
            );

            // --- Segment 2: Apex 到 右底 m2(r, 0) ---

            // C3 (右上控制点)
            const c3x = rk + bulgeX * 0.8;
            const c3y = -r + bulgeY * 1.0;

            // C4 (右中控制点)
            const c4x = r;
            const c4y = -rk - bulgeY * 0.5;

            ctx.bezierCurveTo(
                c3x, c3y, // C3 (靠近 Apex)
                c4x, c4y, // C4 (靠近右底)
                r, 0 // 终点 (m2: 右底点)
            );

            ctx.closePath();
        }

        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
    }



    // ------------------- 动画循环 -------------------

    private animate = () => {
        this.drawEmoji();
        requestAnimationFrame(this.animate);
    }
}

export default StaticEmoji;