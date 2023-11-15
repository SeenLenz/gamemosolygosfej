import { Vec2 } from "../../../lin_alg";
import { Obj } from "../../../renderer/object";
import { Effect } from "../../base/effects";
import {
    CollisionDir,
    Hitbox,
    HitboxFlags,
    ObjectTag,
    StaticGameObj,
} from "../../base/gameobject";
import { DebugPoint } from "../../base/rays";
import { SpriteSheets } from "../../base/textures";

export class StreetLamp extends StaticGameObj {
    switchable = false;
    light_effect: Effect | null = null;
    hitbox_point = new DebugPoint();
    constructor(size: Vec2, pos: Vec2) {
        super(size, pos, false, true);
        this.texture_index = SpriteSheets.SteetLamp;
        this.object_tag = ObjectTag.StreetLamp;
        this.hitboxes[0].flags.push(HitboxFlags.Platform);
        this.hitboxes[0].size.y = 1 * 6;
        this.hitboxes[0].size.x = 5 * 6;
        this.hitboxes[0].pos.x += 3.5 * 6;
        this.hitboxes.push(new Hitbox(this.size, this.pos, false));
        this.set_texture_coords(new Vec2(1, 1), new Vec2(0, 0));
        this.hitbox_point.size = this.hitboxes[0].size;
        this.hitbox_point.pos = this.hitboxes[0].pos;
    }

    loop(delta_time: number) {
        if (this.hitboxes[0].collision_dir(CollisionDir.Top)) {
            if (this.switchable) {
                if (!this.light_effect) {
                    this.light_effect = new Effect(
                        this.size.mul(new Vec2(2.5, 1)),
                        this.pos.sub(new Vec2(8 * 6, 0)),
                        1,
                        SpriteSheets.LampLightEffect,
                        0,
                        0,
                        -1
                    );
                } else {
                    this.light_effect.remove();
                    this.light_effect = null;
                }
            }
            this.switchable = false;
        } else {
            this.switchable = true;
        }
        super.loop(delta_time);
    }
}

export class Wire extends StaticGameObj {
    constructor(size: Vec2, pos: Vec2) {
        super(size, pos, false, false);
        this.texture_index = SpriteSheets.Wire;
        this.object_tag = ObjectTag.Empty;
    }

    loop(delta_time: number) {
        super.loop(delta_time);
        this.animate(400);
    }
}

export class Bench extends StaticGameObj {
    constructor(size: Vec2, pos: Vec2) {
        super(size, pos, false, true);
        this.texture_index = SpriteSheets.Bench;
        this.object_tag = ObjectTag.Bench;
        this.hitboxes[0].size.y = 3 * 6;
        this.hitboxes[0].pos.y += 5 * 6;
        this.sprite_index = 0;
        this.set_texture_coords(new Vec2(1, 1), new Vec2(0, 0));
    }

    loop(delta_time: number) {
        super.loop(delta_time);
    }
}

export class House extends StaticGameObj {
    constructor(size: Vec2, pos: Vec2) {
        super(size, pos, false, true);
        this.texture_index = SpriteSheets.HouseFg;
        this.object_tag = ObjectTag.House;
        this.hitboxes[0].size.y = 4 * 6;
        this.hitboxes[0].pos.y += 40 * 6;
        this.hitboxes[0].size.x = 52 * 6;
        this.hitboxes[0].pos.x += 6 * 6;
        this.hitboxes[0].flags.push(HitboxFlags.Platform);
        this.sprite_index = 0;
        this.set_texture_coords(new Vec2(1, 1), new Vec2(0, 0));
    }

    loop(delta_time: number) {
        super.loop(delta_time);
    }
}
