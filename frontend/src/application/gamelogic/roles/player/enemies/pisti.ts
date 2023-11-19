import { event, gravity } from "../../../../../app";
import { Vec2, interpolate } from "../../../../../lin_alg";
import { EventType, Keys } from "../../../../base/event_handler";
import {
    StaticCollisionObj,
    DynamicGameObj,
    HitboxFlags,
    ObjectTag,
} from "../../../../base/gameobject";
import { Point } from "../../../../base/rays";
import { SpriteSheets } from "../../../../base/textures";
import { Enemy } from "../enemy";

export class Pisti extends Enemy {
    dam_anim_timer = 0;
    hp = 100;
    damagable = true;
    constructor(position: Point) {
        super(Vec2.from(position));
        this.frame_time = 60;
    }

    set_animation() {
        if (performance.now() - this.dam_anim_timer > 6 * 60) {
            this.sprite_index = 0;
            this.damagable = true;
        }
    }

    hit(power: number, dir: Vec2) {
        super.hit(power, dir);
        if (this.damagable) {
            this.sprite_index = 1;
        }
    }

    on_collision_y(obj: StaticCollisionObj): void {
        super.on_collision_y(obj);
        this.velocity.y = this.velocity.y * -0.5;
    }

    on_collision_x(obj: StaticCollisionObj): void {
        let velocity = this.velocity.x;
        super.on_collision_x(obj);
        if (!this.damagable) {
            this.velocity.x = -velocity;
        }
    }
}
