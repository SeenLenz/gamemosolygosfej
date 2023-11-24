import { event } from "../app";
import { Buttons } from "../application/base/event_handler";
import { interpolate } from "../lin_alg";
import { Hud, clearHud } from "./hud";

let opacity = 0.0;
let fadeDirection = 1;
let startKeyPressed = false;

export class Start {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor() {
        const body = document.body;
        const bodyFirstChild = document.querySelector("body > :first-child");

        this.canvas = document.createElement("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        this.canvas.className = "ui_canvas";
        this.canvas.id = "start_canvas";
        this.canvas.setAttribute("tabindex", "0");
        this.canvas.focus();

        const kbEvent = (event: KeyboardEvent) => {
            startKeyPressed = true;
            console.log(event.key);
            this.menuView();
            window.removeEventListener("keydown", kbEvent);
        };

        window.addEventListener("keydown", kbEvent);

        body.insertBefore(this.canvas, bodyFirstChild);
    }

    run() {
        clearHud(this.ctx, this.canvas);

        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (!startKeyPressed) {
            this.animate();
        }

        this.ctx.globalAlpha = 1.0;
    }

    animate() {
        const img = new Image();
        img.src = "./textures/hud/background.png";

        opacity += 0.01 * fadeDirection;

        if (opacity > 1) {
            opacity = 1;
            fadeDirection = -1;
        } else if (opacity < 0.2) {
            // opacity = 0;
            fadeDirection = 1;
        }

        this.ctx.globalAlpha = opacity;
        this.ctx.drawImage(
            img,
            this.canvas.width * 0.5 - img.width * 0.5,
            this.canvas.height * 0.5 - img.height * 0.5,
            img.width,
            img.height
        );
    }

    menuView() {
        const div = document.querySelector("body div");
        // const lobbyOPts = document.querySelectorAll(`body div > *`);
        if (div) {
            const lobby_input = document.createElement(
                "input"
            ) as HTMLInputElement;
            const lobby_join = document.createElement(
                "button"
            ) as HTMLButtonElement;
            const lobby_create = document.createElement(
                "button"
            ) as HTMLButtonElement;
            const lobby_start = document.createElement(
                "button"
            ) as HTMLButtonElement;

            const optJoin = document.createElement(
                "button"
            ) as HTMLButtonElement;
            const optCreate = document.createElement(
                "button"
            ) as HTMLButtonElement;

            lobby_input.type = "text";
            lobby_input.name = "lobby";
            lobby_input.id = "join_label";
            lobby_input.setAttribute(
                "style",
                "width: 20vw; height: 5vh; position: absolute; left: 25vw; top: 50vh; border: none; padding: 0; text-align: center"
            );
            lobby_input.setAttribute("placeHolder", "Input server id");

            lobby_join.id = "join_bt";
            lobby_join.textContent = "Ready Up!";
            lobby_join.setAttribute(
                "style",
                "width: 20vw; height: 5vh; position: absolute; left: 25vw; top: 60vh; text-alaign: center;"
            );

            lobby_create.id = "create_bt";
            lobby_create.textContent = "Get Lobby Id";
            lobby_create.setAttribute(
                "style",
                "width: 20vw; height: 5vh; position: absolute; left: 55vw; top: 50vh; text-alaign: center"
            );

            lobby_start.id = "start_bt";
            lobby_start.textContent = "Start Game";
            const lobby_start_Clicked = () => {
                div.innerHTML = "";
            };
            lobby_start.addEventListener("click", lobby_start_Clicked);
            lobby_start.setAttribute(
                "style",
                "width: 20vw; height: 5vh; position: absolute; left: 40vw; top: 75vh; text-alaign: center"
            );

            optJoin.id = "optJoin_btn";
            optJoin.setAttribute(
                "style",
                'width: 20vw; height: 25vh; position: absolute; left: 25vw; top: 20vh; background-img: url("./textures/hud/join.png"); background-repeat: no-repeat; background-size: cover'
            );

            optCreate.id = "optCreate_btn";
            optCreate.setAttribute(
                "style",
                'width: 20vw; height: 25vh; position: absolute; left: 55vw; top: 20vh; background-img: url("./textures/hud/create.png"); background-repeat: no-repeat; background-size: cover'
            );

            if (div) {
                div.appendChild(lobby_input);
                div.appendChild(lobby_join);
                div.appendChild(lobby_create);
                div.appendChild(lobby_start);
                div.appendChild(optJoin);
                div.appendChild(optCreate);
            }
        }
    }

    close() {}
}
