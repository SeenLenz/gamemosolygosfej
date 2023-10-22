import { gravity } from "./app.js";

export class EventHandler {
    constructor(renderer) {
        this.mouse = {
            pos: {
                x: 0,
                y: 0,
            },
            leftClick: false,
        };

        window.addEventListener("mousemove", (ev) => {
            this.mouse.pos = ev;
        });

        window.addEventListener("mousedown", (ev) => {
            switch (ev.button) {
                case 0:
                    this.mouse.leftClick = true;
                    break;
                default:
                    break;
            }
        });

        window.addEventListener("mouseup", (ev) => {
            switch (ev.button) {
                case 0:
                    this.mouse.leftClick = false;
                    break;
                default:
                    break;
            }
        });



        window.addEventListener("resize", _ => {
            renderer.gl.canvas.width = renderer.gl.canvas.clientWidth;
            renderer.gl.canvas.height = renderer.gl.canvas.clientHeight;
    
            renderer.gl.viewport(0, 0, renderer.gl.canvas.width, renderer.gl.canvas.height);
        })
    }
}