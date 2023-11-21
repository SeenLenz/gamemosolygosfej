import { Vec2, interpolate } from "../../../../../lin_alg";
import { StaticCollisionObj } from "../../../../base/gameobject";
import { Point } from "../../../../base/rays";
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

    damage_taken(power: number, hit_dir: number) {
        super.damage_taken(power, hit_dir);
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
