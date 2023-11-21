import { interpolate } from "../lin_alg";

export class Hud {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    healthRect: {x: number, y: number, width: number, height: number};
    potionRect: {x: number, y: number, width: number, height: number};
    healthUnit: number;
    potionUnit: number;
    
    constructor() {
        const body = document.body;
        const mainCanvas = document.querySelector('body canvas:nth-of-type(1)');
        
        this.canvas = <HTMLCanvasElement>document.createElement('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.healthRect = {x: 0, y: 5, width: 51, height: 18};
        this.potionRect = {x: 25, y: 20, width: 4, height: 9};
        this.healthUnit = 4;
        this.potionUnit = 1;
        this.canvas.className = 'ui_canvas';
        this.canvas.id = 'hud_canvas';

        body?.insertBefore(this.canvas, mainCanvas);
    };
    
    run() {
        this.clearHud();

        const healthBarMask = new Image();
        healthBarMask.src = './textures/hud/HealthBar-maskVer2.png';        

        healthBarMask.onload = () => {

            this.ctx.drawImage(healthBarMask, 0, 5, healthBarMask.width, healthBarMask.height);
            this.ctx.globalCompositeOperation = 'source-in';
            
            this.ctx.fillStyle = 'rgba(102, 0, 0, 255)';
            this.ctx.fillRect(this.healthRect.x, this.healthRect.y, this.healthRect.width, this.healthRect.height);
            
            this.ctx.globalCompositeOperation = "source-over";
            console.log(`HI - ${healthBarMask.width}\nHR - ${this.healthRect.width}`);

            const healthBar = new Image();
            healthBar.src = './textures/hud/HealthBar-finished.png';       

            healthBar.onload = () => {
                this.ctx.imageSmoothingEnabled = false;    
                this.ctx.drawImage(healthBar, 0, this.healthRect.y, healthBar.width, healthBar.height);

                const potionMask = new Image();
                potionMask.src = './textures/hud/potion9by9-mask.png';

                this.ctx.drawImage(potionMask, this.potionRect.x, this.potionRect.y, potionMask.width, potionMask.height);
                    
                this.ctx.globalCompositeOperation = "source-atop";
        
                this.ctx.fillStyle = 'rgba(102, 0, 0, 255)';
                this.ctx.fillRect(this.potionRect.x, this.potionRect.y, potionMask.width, potionMask.height);                    
                
                this.ctx.globalCompositeOperation = "source-over";
                
                const potion = new Image();
                potion.src = './textures/hud/potion9by9-finished.png';
                
                potion.onload = () => {
                    this.ctx.imageSmoothingEnabled = false;        
                    this.ctx.drawImage(potion, this.potionRect.x, this.potionRect.y, potion.width, potion.height);

                    for (let i = 1; i <= 2; i++) {
                        this.ctx.drawImage(potionMask, this.potionRect.x+i*7, this.potionRect.y, potionMask.width, potionMask.height);

                        this.ctx.globalCompositeOperation = "source-atop";
                        
                        this.ctx.fillStyle = 'rgba(102, 0, 0, 255)';
                        this.ctx.fillRect(this.potionRect.x+i*7, this.potionRect.y, potionMask.width, potionMask.height);                    
                        
                        this.ctx.globalCompositeOperation = "source-over";

                        this.ctx.imageSmoothingEnabled = false;        
                        this.ctx.drawImage(potion, this.potionRect.x+i*7, this.potionRect.y, potion.width, potion.height);

                        this.ctx.drawImage(potionMask, this.potionRect.x+i*7, this.potionRect.y, potionMask.width, potionMask.height);

                        this.ctx.globalCompositeOperation = "source-atop";
                        
                        this.ctx.fillStyle = 'rgba(102, 0, 0, 255)';
                        this.ctx.fillRect(this.potionRect.x+i*7, this.potionRect.y, potionMask.width, potionMask.height);                    
                        
                        this.ctx.globalCompositeOperation = "source-over";

                        this.ctx.imageSmoothingEnabled = false;        
                        this.ctx.drawImage(potion, this.potionRect.x+i*7, this.potionRect.y, potion.width, potion.height);                        
                    }
                }
            }
        }

    }

    setHealth(target:number) {
        if (this.healthRect.width > 19) {
            this.healthRect.width = interpolate(this.healthRect.width, target, 0.1);
        }
    }

    clearHud() {
        // this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    openShop() {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(75, 50, 50, 20);
    }

    closeShop() {

    }
}