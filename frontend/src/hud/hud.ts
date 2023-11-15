import { SpriteSheets } from "../application/base/textures";

export class Hud {

    constructor() {
        const body = document.body;
        const main_canvas = document.getElementById('main_canvas');
        const canvas = <HTMLCanvasElement>document.createElement('canvas');
    
        canvas.id = 'hud_canvas';

        const canvasCtx = canvas.getContext('2d');
        
        if (canvasCtx) {
            const healthBar = new Image();
            healthBar.src = './textures/hud/HealthBar-ver1.png';

            healthBar.onload = () => {
            canvasCtx.drawImage(healthBar, 0, 5, 54, 18);
            };
        }

        body?.insertBefore(canvas, main_canvas);
    };
}