import { renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { GameObject } from "./gameobject";

export class Camera {
    pos: Vec2;
    scale: number;
    focus_multip: number = 0.03
    focus_obj!: GameObject;
    constructor() {
        this.pos = new Vec2(0, 0);
        this.scale = 0.5;
    }

    convert() {
        return new Float32Array([this.pos.x, this.pos.y, this.scale]);
    }

    move(delta_time: number) {
        this.pos.x += (this.focus_obj.pos.x - renderer.canvas.width / 2 - this.pos.x) * this.focus_multip * delta_time;
        this.pos.y += (this.focus_obj.pos.y - renderer.canvas.height / 2 - this.pos.y) * this.focus_multip * delta_time;
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
        this.focus_obj = obj;
    }
}