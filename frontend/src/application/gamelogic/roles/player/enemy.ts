import { event, gravity } from "../../../../app";
import { Vec2, interpolate } from "../../../../lin_alg";
import { EventType, Keys } from "../../../base/event_handler";
import {
    CollisionDir,
    DynamicGameObj,
    HitboxFlags,
    ObjectTag,
    StaticCollisionObj,
} from "../../../base/gameobject";
import { Point } from "../../../base/rays";
import { SpriteSheets } from "../../../base/textures";

export class Enemy extends DynamicGameObj {
    dam_anim_timer = 0;
    hp = 100;
    damagable = true;
    ground_hit = false;
    ground_hit_lock = false;
    constructor(position: Point) {
        super(new Vec2(96, 96), Vec2.from(position));
        this.texture_index = SpriteSheets.Pisti;
        this.sprite_index = 0;
        this.object_tag = ObjectTag.Enemy;
        this.hitboxes[0].flags.push(HitboxFlags.NonPlayerReactive);
        this.hitboxes[0].flags.push(HitboxFlags.Enemy);
        this.mass = 1;
    }

    get grounded() {
        return this.hitboxes[0].collision_dir(CollisionDir.Bottom);
    }

    get main_hitbox() {
        return this.hitboxes[0];
    }

    loop(delta_time: number): void {
        this.set_animation();
        this.animate(this.frame_time);
        this.ground_hit = false;
        if (this.grounded && !this.ground_hit && !this.ground_hit_lock) {
            this.ground_hit = true;
            this.ground_hit_lock = true;
        }
        if (!this.grounded) {
            this.ground_hit_lock = false;
        }
        super.loop(delta_time);
    }

    run(delta_time: number): void {
        this.add_force(new Vec2(0, gravity * this.mass));
        if (this.grounded) {
            this.velocity.x -= interpolate(
                this.velocity.x,
                0,
                0.1 * delta_time
            );
        }
        if (event.key_state(Keys.R, EventType.Pressed)) {
            this.pos.y = -200;
            this.pos.x = Math.random() * 800;
            this.set_hb_position();
        }
    }

    set_animation() {}

    hit(damage: number, dir: Vec2) {
        if (this.damagable) {
            this.dam_anim_timer = performance.now();
            // this.velocity.x = (damage / 5) * dir.x;
            // this.velocity.y = (damage / 10) * dir.y;
            this.hp -= damage;
            // if (this.hp < 0) {
            //     this.remove();
            // }
            this.damagable = false;
        }
    }

    on_collision_y(obj: StaticCollisionObj): void {
        super.on_collision_y(obj);
    }

    on_collision_x(obj: StaticCollisionObj): void {
        let velocity = this.velocity.x;
        super.on_collision_x(obj);
        if (!this.damagable) {
            this.velocity.x = -velocity;
        }
    }
}
