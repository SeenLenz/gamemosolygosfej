import { event, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { EventType, Keys } from "./event_handler";
import { DynamicGameObj, GameObject, ObjectTag } from "./gameobject";

export class Camera {
    pos: Vec2;
    scale: number;
    focus_multip: number = 0.03;
    focus_obj?: GameObject;
    rotation: number;
    target_zoom = 275;
    cam_shake = false;
    shake_timer = 0;
    shake_strength = 0.1;
    constructor() {
        this.pos = new Vec2(0, 0);
        this.scale = 1;
        this.rotation = 0;
    }

    convert() {
        return new Float32Array([this.pos.x, this.pos.y, this.scale]);
    }

    shake() {
        this.cam_shake = true;
        this.shake_timer = performance.now();
    }

    shake_camera(delta_time: number) {
        if (!this.cam_shake) {
            return;
        }
        if (performance.now() - this.shake_timer < 50) {
            this.pos.x += 100 * this.shake_strength * delta_time;
            this.pos.y += 100 * this.shake_strength * delta_time;
            this.rotation +=
                (0.2 - this.rotation) * this.shake_strength * delta_time;
        } else if (performance.now() - this.shake_timer < 100) {
            this.pos.x += -100 * this.shake_strength * delta_time;
            this.pos.y += -100 * this.shake_strength * delta_time;
            this.rotation +=
                (-0.2 - this.rotation) * this.shake_strength * delta_time;
        } else {
            this.cam_shake = false;
        }
    }

    move(delta_time: number) {
        if (!this.focus_obj) {
            return;
        }
        this.pos.x +=
            (this.focus_obj.pos.x +
                this.focus_obj.size.x / 2 -
                renderer.canvas.width / 2 -
                this.pos.x) *
            this.focus_multip *
            delta_time;
        this.pos.y +=
            (this.focus_obj.pos.y +
                this.focus_obj.size.y / 2 -
                renderer.canvas.height / 2 -
                this.pos.y) *
            this.focus_multip *
            delta_time;
        if (this.focus_obj.object_tag != ObjectTag.Empty) {
            this.scale +=
                ((this.target_zoom / this.focus_obj.size.y) * 0.5 -
                    this.scale) *
                this.focus_multip *
                delta_time;
        }
        if (this.rotation != 0) {
            this.rotation +=
                (0 - this.rotation) * this.shake_strength * delta_time;
        }
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
            this.pos.y - renderer.canvas.height * this.scale + this.height / 2
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
