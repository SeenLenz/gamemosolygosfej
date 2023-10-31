import { event, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { EventType, Keys } from "./event_handler";
import { GameObject, ObjectTag } from "./gameobject";

export class Camera {
    pos: Vec2;
    scale: number;
    focus_multip: number = 0.03
    focus_obj!: GameObject;
    rotation: number;
    constructor() {
        this.pos = new Vec2(0, 0);
        this.scale = 0.5;
        this.rotation = 0;
    }

    convert() {
        return new Float32Array([this.pos.x, this.pos.y, this.scale]);
    }

    move(delta_time: number) {
        this.pos.x += (this.focus_obj.pos.x + this.focus_obj.size.x / 2 - renderer.canvas.width / 2 - this.pos.x) * this.focus_multip * delta_time;
        this.pos.y += (this.focus_obj.pos.y + this.focus_obj.size.y / 2 - renderer.canvas.height / 2 - this.pos.y) * this.focus_multip * delta_time;
        if (this.focus_obj.object_tag != ObjectTag.Empty){
            this.scale += (100 / this.focus_obj.size.y * 0.5 - this.scale) * this.focus_multip * delta_time;
        }

        if (event.key_state(Keys.Space, EventType.Down)) {
            this.rotation = (this.rotation + 0.03 * delta_time)  % (3.141 * 2);
        }
        // 200 / height
    }
    
    get zero() {
        return new Vec2(
            this.pos.x - renderer.canvas.width * this.scale, 
            this.pos.y - renderer.canvas.height * this.scale
            );
    }

    get center() {
        return new Vec2(
            this.pos.x - renderer.canvas.width * this.scale + this.width / 2, 
            this.pos.y - renderer.canvas.height * this.scale+ this.height / 2
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