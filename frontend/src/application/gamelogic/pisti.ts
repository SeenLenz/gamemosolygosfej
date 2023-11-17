import { gravity } from "../../app";
import { Vec2, interpolate } from "../../lin_alg";
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
        this.velocity.x = interpolate(this.velocity.x, 0, 0.1);
    }

    set_animation() {
        if (performance.now() - this.dam_anim_timer > 6 * 60) {
            this.sprite_index = 0;
            this.damagable = true;
        }
    }

    hit(power: number, dir: number) {
        if (this.damagable) {
            this.dam_anim_timer = performance.now();
            this.sprite_index = 1;
            this.velocity.x = power * dir;
            this.velocity.y = -3;
            this.hp -= power;
            this.damagable = false;
        }

        if (this.hp < 0) {
            this.remove();
        }
    }

    on_collision_y(obj: StaticCollisionObj): void {
        super.on_collision_y(obj);
        this.velocity.y = this.velocity.y * -0.5;
    }
}
