import { event } from "../app";
import { Keys, EventType } from "../application/base/event_handler";
import { interpolate } from "../lin_alg";

export class Hud {

    healthBar: HTMLImageElement;
    ctx: CanvasRenderingContext2D;
    healthRect: {x: number, y: number, width: number, height: number};
    healthUnit : number;    
    
    constructor() {
        const body = document.body;
        const mainCanvas = document.querySelector('body canvas:nth-of-type(1)');
        const canvas = <HTMLCanvasElement>document.createElement('canvas');

        this.healthBar = new Image();
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.healthRect = {x: 0, y: 5, width: 51, height: 18};
        this.healthUnit = 4;

        canvas.className = 'ui_canvas';
        canvas.id = 'hud_canvas';

        
        
        body?.insertBefore(canvas, mainCanvas);
    };
    
    run() {
        const healthBarMask = new Image();

        healthBarMask.src = './textures/hud/HealthBar-mask.png';
        this.healthBar.src = './textures/hud/HealthBar-finished.png';
        
        healthBarMask.onload = () => {

            this.ctx.drawImage(healthBarMask, 0, 5, healthBarMask.width, healthBarMask.height);

            this.ctx.globalCompositeOperation = 'source-in';
            
            this.ctx.fillStyle = 'rgba(102, 0, 0, 255)';
            this.ctx.fillRect(this.healthRect.x, this.healthRect.y, this.healthRect.width, this.healthRect.height);
            
            this.ctx.globalCompositeOperation = "source-over";

            this.ctx.imageSmoothingEnabled = false;                 
            this.ctx.drawImage(this.healthBar, 0, 5, 54, 18);

            this.setHealth(30);
        }

    }

    setHealth(target:number) {
        if (this.healthRect.width > 19) {
            this.healthRect.width -= interpolate(this.healthRect.width, target, 0.1);
        }
    }

    openShop() {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(75, 50, 50, 20);
    }

    closeShop() {

    }
}