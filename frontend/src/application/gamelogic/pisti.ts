import { gravity } from "../../app";
import { Vec2, interpolate } from "../../lin_alg";
import {
    StaticCollisionObj,
    DynamicGameObj,
    HitboxFlags,
    ObjectTag,
} from "../base/gameobject";
import { SpriteSheets } from "../base/textures";

export class Pisti extends DynamicGameObj {
    damaged = false;
    damage_dir = 0;
    constructor() {
        super(new Vec2(96, 96), new Vec2(100, -200));
        this.texture_index = SpriteSheets.Pisti;
        this.sprite_index = 0;
        this.object_tag = ObjectTag.Pisti;
        this.hitboxes[0].flags.push(HitboxFlags.NonPlayerReactive);
        this.hitboxes[0].flags.push(HitboxFlags.Enemy);
        this.mass = 1;
    }

    loop(delta_time: number): void {
        this.animate(100);
        super.loop(delta_time);
    }

    run(delta_time: number): void {
        this.add_force(new Vec2(0, gravity * this.mass));
        this.velocity.x = interpolate(this.velocity.x, 0, 0.01);

        if (this.damaged) {
            this.velocity.x = 10 * this.damage_dir;
            this.velocity.y = -3;
            this.damaged = false;
        }
    }

    on_collision_y(obj: StaticCollisionObj): void {
        super.on_collision_y(obj);
        this.velocity.y = this.velocity.y * -0.5;
    }
}
