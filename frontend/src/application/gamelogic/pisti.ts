import { event, gravity } from "../../app";
import { Vec2, interpolate } from "../../lin_alg";
import { EventType, Keys } from "../base/event_handler";
import {
    StaticCollisionObj,
    DynamicGameObj,
    HitboxFlags,
    ObjectTag,
    GameObject,
} from "../base/gameobject";
import { Point } from "../base/rays";
import { SpriteSheets } from "../base/textures";

export class Pisti extends DynamicGameObj {
    dam_anim_timer = 0;
    hp = 100;
    damagable = true;
    constructor(position: Point) {
        super(new Vec2(96, 96), Vec2.from(position));
        this.texture_index = SpriteSheets.Pisti;
        this.sprite_index = 0;
        this.object_tag = ObjectTag.Pisti;
        this.hitboxes[0].flags.push(HitboxFlags.NonPlayerReactive);
        this.hitboxes[0].flags.push(HitboxFlags.Enemy);
        this.mass = 1;
    }

    loop(delta_time: number): void {
        this.set_animation();
        this.animate(60);
        super.loop(delta_time);
    }

    run(delta_time: number): void {
        this.add_force(new Vec2(0, gravity * this.mass));
        this.velocity.x -= interpolate(this.velocity.x, 0, 0.1 * delta_time);
        if (event.key_state(Keys.R, EventType.Pressed)) {
            this.pos.y = -200;
            this.pos.x = Math.random() * 1800;
            this.set_hb_position();
        }
    }

    set_animation() {
        if (performance.now() - this.dam_anim_timer > 6 * 60) {
            this.sprite_index = 0;
            this.damagable = true;
        }
    }

    hit(power: number, dir: Vec2) {
        if (this.damagable) {
            this.dam_anim_timer = performance.now();
            this.sprite_index = 1;
            this.velocity.x = (power / 5) * dir.x;
            this.velocity.y = (power / 10) * dir.y;
            // this.hp -= power;
            this.damagable = false;
            if (this.hp < 0) {
                this.remove();
            }
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
