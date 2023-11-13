import { Vec2 } from "../../../lin_alg";
import { ObjectTag, StaticGameObj } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";

export enum GroundPos {
    LeftCorner = -1,
    Center,
    RightCorner,
}

export class Ground extends StaticGameObj {
    constructor(size: Vec2, pos: Vec2, type: number) {
        super(size.mul(new Vec2(48, 48)), pos.mul(new Vec2(48, 48)), false);
        this.hitboxes[0].size.y = this.size.y - 18;
        this.hitboxes[0].pos.y += 18;
        this.object_tag = ObjectTag.Terrain;
        this.texture_index = SpriteSheets.Ground + Math.abs(type);
        this.sprite_index = (type + 1) / 2;
        this.set_texture_coords(
            new Vec2(size.x / this.texture.max_sprites.x, size.y),
            new Vec2(this.sprite_index, 0)
        );
    }

    loop(delta_time: number) {
        super.loop(delta_time);
    }
}

export class UnderGround extends StaticGameObj {
    constructor(size: Vec2, pos: Vec2) {
        super(size.mul(new Vec2(48, 48)), pos.mul(new Vec2(48, 48)), false);
        this.texture_index = SpriteSheets.UnderGround;
        this.set_texture_coords(
            new Vec2(this.size.x / 48 / 4, this.size.y / 48),
            new Vec2(0, 0)
        );
    }

    loop(delta_time: number) {
        super.loop(delta_time);
    }
}
