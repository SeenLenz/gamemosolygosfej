import { Vec2 } from "../../../lin_alg";
import { ObjectTag, StaticGameObj } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";

export enum GroundPos {
    LeftCorner = -1,
    Center,
    RightCorner,
}

export class Ground extends StaticGameObj {
    constructor(size: Vec2, pos: Vec2, type: number, z: number) {
        super(size.mul(new Vec2(48, 48)), pos.mul(new Vec2(48, 48)), false);
        this.hitboxes[0].size.y = this.size.y - 18;
        this.z_coord = z;
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
    constructor(size: Vec2, pos: Vec2, type: number, z: number) {
        super(size.mul(new Vec2(48, 48)), pos.mul(new Vec2(48, 48)), false);
        this.z_coord = z;
        this.object_tag = ObjectTag.Terrain;
        this.texture_index = SpriteSheets.UnderGround + Math.abs(type);
        this.sprite_index = (type + 1) / 2;
        this.set_texture_coords(
            new Vec2(
                size.x / this.texture.max_sprites.x,
                size.y / this.texture.max_sprites.y
            ),
            new Vec2(this.sprite_index, 0)
        );
    }

    loop(delta_time: number) {
        super.loop(delta_time);
    }
}
