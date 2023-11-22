import { interpolate } from "../lin_alg";
import { Hud, clearHud } from "./hud";

let opacity = 0.0;
let fadeDirection = 1;

export class Start {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor() {
        const body = document.body;
        const mainCanvas = document.querySelector('body canvas:nth-of-type(1)') as HTMLCanvasElement;

        this.canvas = document.createElement('canvas') as HTMLCanvasElement;        
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        this.canvas.className = 'ui_canvas';
        this.canvas.id = 'start_canvas';
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.focus();       
         
        window.addEventListener('keydown', (event:KeyboardEvent) => {
          console.log(event.key);
        });        

        body.insertBefore(this.canvas, mainCanvas);
    }

    run() {
        clearHud(this.ctx, this.canvas);

        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        
        const img = new Image();
        img.src = './textures/hud/background.png';
        
        this.animate(img);
        
        this.ctx.globalAlpha = 1.0;
    }

    animate(img:HTMLImageElement) {
      opacity += 0.01 * fadeDirection;

      if (opacity > 1) {
        opacity = 1;
        fadeDirection = -1;
      }
      else if (opacity < 0) {
        opacity = 0;
        fadeDirection = 1;
      }

      this.ctx.globalAlpha = opacity;
      this.ctx.drawImage(img, this.canvas.width*0.5-img.width*0.5, this.canvas.height*0.5-img.height*0.5, img.width, img.height);
    }
}