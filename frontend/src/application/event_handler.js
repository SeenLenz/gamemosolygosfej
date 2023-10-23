import { gravity } from "./app.js";

export class EventHandler {
    constructor(renderer) {
        this.mouse = {
            pos: {
                x: 0,
                y: 0,
            },
            prev_pos: {
                x: 0,
                y: 0,
            },

            
            leftClick: false,
        };
        
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
        };

        window.addEventListener("mousemove", (ev) => {
            this.mouse.prev_pos = this.mouse.pos;
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

        document.addEventListener('keypress', (event) => {
            const key = event.code;
                    
            if (key == "KeyW") {
                this.keys.w = true;
            }
        });

        document.addEventListener('keydown', (event) => {
            const key = event.key;
                    
            if (key === "w") {
                this.keys.w = true;
            }
        });

        document.addEventListener('keyup', (event) => {
            const key = event.key;
                    
            if (key === "w") {
                this.keys.w = false;
            }
        });

        window.addEventListener("resize", _ => {
            renderer.gl.canvas.width = renderer.gl.canvas.clientWidth;
            renderer.gl.canvas.height = renderer.gl.canvas.clientHeight;
    
            renderer.gl.viewport(0, 0, renderer.gl.canvas.width, renderer.gl.canvas.height);
        })
    }
}