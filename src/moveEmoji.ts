interface EmojiState {
    color: string; 
    expression?: string;
}

class StaticEmoji {
    public canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private emojiSize: number = 200;
    private halfSize: number; 
    private emojis: Record<string, string>;

    //-----------------表情颜色设置------------------
    private faceColor: string = '#FFD700'; 
    private pupilColor: string = '#000000';
    private mouthColor: string = '#000000';

    
    private mouseX: number = 0;
    private mouseY: number = 0;

    
    public fixedCenterX: number;
    public fixedCenterY: number;
    private centerShiftY: number = -15; 

    
    private globalX: number = 0;
    private globalY: number = 0;

    
    private featureOffsetX: number = 0;
    private featureOffsetY: number = 0;

    
    private featureGroupRadius: number; 
    
    private maxMovementRadius: number; 

    public currentState: EmojiState = {
        color: this.faceColor, 
        expression: 'default'
    };

    private isDefaultState: boolean = false;

    public getIsDefaultState(): boolean {
        return this.isDefaultState;
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

        this.halfSize = this.emojiSize / 2; 

        
        this.featureGroupRadius = this.halfSize / 4; 

        
        this.maxMovementRadius = this.halfSize - this.featureGroupRadius;

        this.updateGlobalPosition();
        window.addEventListener('resize', this.updateGlobalPosition.bind(this));
        window.addEventListener('scroll', this.updateGlobalPosition.bind(this));

        this.animate();
    }

    // 实时更新表情中心点的全局坐标 
    private updateGlobalPosition() {
        const rect = this.canvas.getBoundingClientRect();
        this.globalX = rect.left + this.fixedCenterX;
        this.globalY = rect.top + this.fixedCenterY;
    }

    // 供全局事件调用的方法：更新鼠标位置，并计算特征组的新偏移量
    public updateMousePosition(x: number, y: number) {
        this.mouseX = x;
        this.mouseY = y;
        const dx = this.mouseX - this.globalX;
        const dy = this.mouseY - this.globalY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        let constrainedDx = dx;
        let constrainedDy = dy;
        if (distance > this.halfSize) {
            const ratio = this.halfSize / distance;
            constrainedDx = dx * ratio;
            constrainedDy = dy * ratio;
        }
        const finalDistance = Math.sqrt(constrainedDx * constrainedDx + constrainedDy * constrainedDy);

        if (finalDistance > this.maxMovementRadius) {
             const ratio = this.maxMovementRadius / finalDistance;
             this.featureOffsetX = constrainedDx * ratio;
             this.featureOffsetY = constrainedDy * ratio;
        } else {
             this.featureOffsetX = constrainedDx;
             this.featureOffsetY = constrainedDy;
        }
        
        if (this.featureOffsetY + this.featureGroupRadius > 0) {
            this.featureOffsetY = -this.featureGroupRadius;
        }

        if (this.isDefaultState) {
            
            this.setState({ expression: 'default' }, false);
            this.isDefaultState = false;
        }
    }

    public setState(newState: Partial<EmojiState>, isDefault: boolean = false) {
        
        this.currentState = {
            ...this.currentState,
            ...newState,
            color: this.faceColor 
        };
        this.isDefaultState = isDefault;
    }

    // ------------------- 绘图逻辑 -------------------

    private drawEmoji() {
        const { ctx, emojiSize, currentState } = this;
        const r = this.halfSize;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.translate(this.fixedCenterX, this.fixedCenterY);
        this.drawFace(ctx, r, this.faceColor); 
        ctx.save();
        
        ctx.translate(this.featureOffsetX, this.featureOffsetY);

        const mouthY = r * 0.05; 
        const emojiStr = this.emojis[currentState.expression || 'default']!;
        ctx.fillStyle = this.mouthColor;
        ctx.font = `${r * 0.2}px Arial`; 
        ctx.textAlign = 'center';
        ctx.fillText(emojiStr, 0, mouthY);
        ctx.restore();
        ctx.restore();
    }

    private drawFace(ctx: CanvasRenderingContext2D, r: number, color: string) {
        const { featureOffsetX, featureOffsetY } = this;

        const dist = Math.sqrt(featureOffsetX * featureOffsetX + featureOffsetY * featureOffsetY);
        const maxDist = this.maxMovementRadius;
        const strength = Math.min(1, dist / maxDist);
        const Y_movement = -featureOffsetY;
        const max_Y_movement = r;

        
        const y_driver = Math.min(1, Math.max(-1, Y_movement / max_Y_movement));

        
        const bulgeY = r * 0.06 * y_driver * strength; 

        
        let bulgeX = 0;
        if (dist > 1) {
           const x_driver = featureOffsetX / dist; 
           
           bulgeX = r * 0.15* x_driver * strength;
        }
        if (strength < 0.01) {
             
            ctx.beginPath();
            ctx.moveTo(-r, 0);
            ctx.lineTo(r, 0);
            ctx.arc(0, 0, r, 0, Math.PI, true);
            ctx.closePath();
        } else {
            
            const k = 0.5519;
            const rk = r * k;
            const APEX_X = bulgeX;
            const APEX_Y = -r + bulgeY * 1.5; 

            ctx.beginPath();

            const m_pos = r / 2;
            ctx.moveTo(r, 0);
            
            ctx.lineTo(-r, 0); 
            const c1x = -r;
            const c1y = -rk - bulgeY * 0.5; 

            
            const c2x = -rk + bulgeX * 0.8;
            const c2y = -r + bulgeY * 1.0;

            ctx.bezierCurveTo(
                c1x, c1y, 
                c2x, c2y, 
                APEX_X, APEX_Y 
            );

            const c3x = rk + bulgeX * 0.8;
            const c3y = -r + bulgeY * 1.0;
            const c4x = r;
            const c4y = -rk - bulgeY * 0.5;

            ctx.bezierCurveTo(
                c3x, c3y, 
                c4x, c4y, 
                r, 0 
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
