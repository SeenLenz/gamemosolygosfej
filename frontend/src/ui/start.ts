import { interpolate } from "../lin_alg";

export class Start {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor() {
        const body = document.body;
        const mainCanvas = document.querySelector('body canvas:nth-of-type(1)');

        this.canvas = document.createElement('canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        this.canvas.className = 'ui_canvas';
        this.canvas.id = 'canvas_start';
        
        

        body.insertBefore(this.canvas, mainCanvas);
    }

    run() {
        let opacity = 0;

        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        
        const background = new Image();
        background.src = './textures/hud/background.png';
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(background, this.canvas.width*0.5-background.width*0.5, this.canvas.height*0.5-background.height*0.5, background.width, background.height);

        this.ctx.globalAlpha = interpolate(opacity, 1.0, 0.1);

        this.canvas.addEventListener('click', () => {
           close(); 
        });
    }

    close() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);        
    }


}