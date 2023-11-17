import { gravity } from "../../app";
import { Vec2, interpolate } from "../../lin_alg";
import { CollisionObj, DynamicGameObj, HitboxFlags } from "../base/gameobject";
import { SpriteSheets } from "../base/textures";

export class Pisti extends DynamicGameObj {
    constructor() {
        super(new Vec2(96, 96), new Vec2(100, -200));
        this.texture_index = SpriteSheets.Pisti;
        this.sprite_index = 0;
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
    }

    on_collision_y(obj: CollisionObj): void {
        super.on_collision_y(obj);
        this.velocity.y = this.velocity.y * -0.5;
    }
}
