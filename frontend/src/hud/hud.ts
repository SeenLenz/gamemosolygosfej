import { SpriteSheets } from "../application/base/textures";

export class Hud {

    healthBar: HTMLImageElement;
    ctx: CanvasRenderingContext2D;
    
    constructor() {
        const body = document.body;
        const main_canvas = document.getElementById('main_canvas');
        const canvas = <HTMLCanvasElement>document.createElement('canvas');

        this.healthBar = new Image();
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;            
        
        canvas.id = 'hud_canvas';
        
        body?.insertBefore(canvas, main_canvas);
    };
    
    run() {
        this.healthBar.src = './textures/hud/HealthBar-ver1.png';
        
        this.healthBar.onload = () => {
                this.ctx.imageSmoothingEnabled = false;                
                                
                console.log(this.ctx.imageSmoothingEnabled);
                this.ctx.drawImage(this.healthBar, 0, 5, 54, 18);
            }
    }
}