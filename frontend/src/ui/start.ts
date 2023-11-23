import { Hud, clearHud } from "./hud";
import { Network } from "../networking/networking";
import { WorkerMsg } from "../networking/WorkerMsg";
import { Type } from "../../../types";
import { main } from "../app";

let opacity = 0.0;
let fadeDirection = 1;
let startKeyPressed = false;

export const network = new Network("127.0.0.1:6969");

export class Start {

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor() {
        const body = document.body;
        const bodyFirstChild = document.querySelector('body > :first-child');
        
        this.canvas = document.createElement('canvas') as HTMLCanvasElement;        
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        
        this.canvas.className = 'ui_canvas';
        this.canvas.id = 'start_canvas';
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.focus();       
        
        const kbEvent = () => {
          startKeyPressed = true;
          this.menuView();
          window.removeEventListener('keydown', kbEvent);

        }

        window.addEventListener('keydown', kbEvent);

        body.insertBefore(this.canvas, bodyFirstChild);
    }

    run() {
        clearHud(this.ctx, this.canvas);
        
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);

        if (!startKeyPressed) {
          this.animate();
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    animate() {
      const img = new Image();
      img.src = './textures/hud/background.png';

      img.onload = () => {
        opacity += 0.01 * fadeDirection;
  
        if (opacity > 1) {
          opacity = 1;
          fadeDirection = -1;
        }
        else if (opacity < 0.2) {
          fadeDirection = 1;
        }
  
        this.ctx.globalAlpha = opacity;
        this.ctx.drawImage(img, this.canvas.width*0.5-img.width*0.5, this.canvas.height*0.5-img.height*0.5, img.width, img.height);
      }

    }

    menuView() {
      const div = document.querySelector('body div')
      if (div) {
        const lobby_input = document.createElement('input') as HTMLInputElement;
        const lobby_join = document.createElement('button') as HTMLButtonElement;
        const lobby_create = document.createElement('button') as HTMLButtonElement;
        const lobby_start = document.createElement('button') as HTMLButtonElement;
        const lobby_id = document.createElement('label') as HTMLLabelElement;

        const optJoin = document.createElement('button') as HTMLButtonElement;
        const optCreate = document.createElement('button') as HTMLButtonElement;

        lobby_join?.addEventListener("click", (e) => {
        const joinLabelValue = (
            lobby_join as HTMLInputElement | null
          )?.value;
          if (joinLabelValue) {
            network.join_lobby(joinLabelValue);
          }
        });
        lobby_start?.addEventListener("click", (e) => {
          network.send(new WorkerMsg(Type.start));
          lobby_start?.remove();
          this.close();
        });
        lobby_create?.addEventListener("click", (e) => {
          network.create_lobby();
        });

        if (lobby_input) {
          lobby_input.id = 'join_label';
          lobby_input.setAttribute('style', 'width: 20vw; height: 5vh; position: absolute; left: 25vw; top: 50vh; border: none; text-align: center;');
          lobby_input?.setAttribute('placeHolder', 'Input server id;'); 
        }        
        if (lobby_join) {
          lobby_join.id = 'join_bt';
          lobby_join.textContent = 'Ready Up!';
          lobby_join.setAttribute('style', 'width: 20vw; height: 5vh; position: absolute; left: 25vw; top: 60vh; text-align: center;');          
        }
        if (lobby_create) {
          lobby_create.id = 'create_bt';
          lobby_create.textContent = 'Get Lobby Id';
          lobby_create.setAttribute('style', 'width: 20vw; height: 5vh; position: absolute; left: 55vw; top: 50vh; text-align: center;');          
        }
        if (lobby_id) {
          lobby_id.id = 'lobby_lb';
          lobby_id.setAttribute('style', 'width: 20vw; height: 5vh; position: absolute; left: 55vw; top: 60vh; text-align: center;');
        }
        if (lobby_start) {
          lobby_start.id = 'start_bt';
          lobby_start.textContent = 'Start Game';
          lobby_start.setAttribute('style', 'width: 20vw; height: 5vh; position: absolute; left: 40vw; top: 70vh; text-align: center;');    
        }

        optJoin.id = 'optJoin_btn';        
        optJoin.setAttribute('style', 'width: 20vw; height: 25vh; position: absolute; left: 25vw; top: 20vh;');

        optCreate.id = 'optCreate_btn';
        optCreate.setAttribute('style', 'width: 20vw; height: 25vh; position: absolute; left: 55vw; top: 20vh;');
      
        div.appendChild(optJoin);
        div.appendChild(optCreate);
        div.appendChild(lobby_input);  
        div.appendChild(lobby_join);  
        div.appendChild(lobby_create);  
        div.appendChild(lobby_id);  
        div.appendChild(lobby_start);
      }
    }

    close() {
      this.canvas.remove();
    }
}