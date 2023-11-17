import { SpriteSheets } from "../application/base/textures";

export class Hud {

    healthBar: HTMLImageElement;
    ctx: CanvasRenderingContext2D;
    
    constructor() {
        const body = document.body;
        const act_first_canvas = document.querySelector('body canvas:nth-of-type(1)');
        console.log(act_first_canvas?.id);
        const canvas = <HTMLCanvasElement>document.createElement('canvas');

        this.healthBar = new Image();
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;            
        
        canvas.className = 'ui_canvas';
        canvas.id = 'hud_canvas';
        
        body?.insertBefore(canvas, act_first_canvas);
    };
    
    run() {
        this.healthBar.src = './textures/hud/HealthBar-ver1.png';
        
        this.healthBar.onload = () => {
                this.ctx.imageSmoothingEnabled = false;                
                                
                this.ctx.drawImage(this.healthBar, 0, 5, 54, 18);
            }
    }

    openShop() {
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(75, 50, 50, 20);
    }

    closeShop() {

    }
}