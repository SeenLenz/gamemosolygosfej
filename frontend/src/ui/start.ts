import { clearCanvas } from "./hud";
import { Network } from "../networking/networking";
import { WorkerMsg } from "../networking/WorkerMsg";
import { Type } from "../../../types";
import { main } from "../app";

let opacity = 0.0;
let fadeDirection = 1;
let startKeyPressed = false;

export const network = new Network("127.0.0.1:6969");

export class StartScreen {
  
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
        clearCanvas(this.ctx, this.canvas);

        callback();
        
        console.log(startKeyPressed);
        
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
        optJoin.setAttribute('style','width: 20vw; height: 25vh; position: absolute; left: 25vw; top: 20vh; background-image:url("./textures/hud/background.png"); background-repeat: no-repeat; background-size: contain');

        optCreate.id = 'optCreate_btn';
        optCreate.setAttribute('style', 'width: 20vw; height: 25vh; position: absolute; left: 55vw; top: 20vh; background-image:url("./textures/hud/background.png");background-repeat: no-repeat; background-size: contain;');
      
        div.appendChild(optJoin);
        div.appendChild(optCreate);
        div.appendChild(lobby_input);  
        div.appendChild(lobby_join);  
        div.appendChild(lobby_create);  
        div.appendChild(lobby_id);  
        div.appendChild(lobby_start);

        document.querySelector("#join_bt")?.addEventListener("click", (e) => {
          const joinLabelValue = (
              document.querySelector("#join_label") as HTMLInputElement | null
          )?.value;
          if (joinLabelValue) {
              network.join_lobby(joinLabelValue);
          }
        });
        document.querySelector("#start_bt")?.addEventListener("click", (e) =>   {
            const msg = new WorkerMsg(Type.start);
            network.send(msg);
            document.querySelector("#start_bt")?.remove();
            main((msg.data).role);
            this.close();
            div.innerHTML = '';
        });
        document.querySelector("#create_bt")?.addEventListener("click", (e)   => {
            network.create_lobby();
        });        
      }
    }

    close() {
      this.canvas.remove();
    }
}

function callback() {
  const startImg = new Image();
  startImg.src = './textures/hud/background.png';

  const canvas = document.getElementById('start_canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  clearCanvas(ctx, canvas);

  ctx.fillStyle = 'blue';
  ctx.fillRect(0,0,canvas.width, canvas.height);

  animate(startImg, canvas, ctx);

  if (!startKeyPressed) {
    requestAnimationFrame(callback);
  }
}

function animate(img:HTMLImageElement, canvas:HTMLCanvasElement, ctx:CanvasRenderingContext2D) {

  img.onload = () => {
    opacity += 0.01 * fadeDirection;

    if (opacity > 1) {
      opacity = 1;
      fadeDirection = -1;
    }
    else if (opacity < 0.2) {
      fadeDirection = 1;
    }

    ctx.globalAlpha = opacity;
    ctx.drawImage(img, canvas.width*0.5-img.width*0.5, canvas.height*0.5-img.height*0.5, img.width, img.height);

    ctx.globalAlpha = 1.0;
    
  }
}