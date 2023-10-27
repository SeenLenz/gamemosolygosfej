import { renderer } from "../app.js";

export class Camera {
    constructor() {
        this.pos = {
            x: 0,
            y: 0,
        };

        this.scale = 0.5;
    }

    convert() {
        return [this.pos.x, this.pos.y, this.scale];
    }
    
    get zero() {
        return {y: this.pos.y - renderer.canvas.height * this.scale, x: this.pos.x - renderer.canvas.width * this.scale};   
    }

    get width() {
        return renderer.canvas.width / this.scale;
    }

    get height() {
        return renderer.canvas.height / this.scale;
    }

    focus_on(obj) {
        this.pos.x = obj.object.transform.pos.x;
        this.pos.y = obj.object.transform.pos.y - renderer.canvas.height / 2;
    }
}