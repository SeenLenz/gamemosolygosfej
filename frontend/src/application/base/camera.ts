import { renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { GameObject } from "./gameobject";

export class Camera {
    pos: Vec2;
    scale: number;
    constructor() {
        this.pos = new Vec2(0, 0);

        this.scale = 0.5;
    }

    convert() {
        return new Float32Array([this.pos.x, this.pos.y, this.scale]);
    }
    
    get zero() {
        return new Vec2(
            this.pos.x - renderer.canvas.width * this.scale, 
            this.pos.y - renderer.canvas.height * this.scale
            );   
    }

    get width() {
        return renderer.canvas.width / this.scale;
    }

    get height() {
        return renderer.canvas.height / this.scale;
    }

    focus_on(obj: GameObject) {
        this.pos.x = obj.pos.x;
        this.pos.y = obj.pos.y - renderer.canvas.height / 2;
    }
}