import { Vec2 } from "../../lin_alg";
import { ObjectTag, StaticGameObj } from "../base/gameobject";

export class Terrain extends StaticGameObj {
    constructor(pos: Vec2, scale: Vec2, t_index: number) {
        super(scale, pos);
        this.object_tag = ObjectTag.Terrain;
        this.hitboxes[0].size.y = this.size.y - 18;
        this.hitboxes[0].pos.y += 18;
        this.texture_index = t_index;
        this.z_coord = 1;
    }

    loop(delta_time: number): void {
        super.loop(delta_time);
        this.set_texture_coords(
            new Vec2(this.size.x / 48 / 4, this.size.y / 48),
            new Vec2(0, 0)
        );
    }
}

export class Background extends StaticGameObj {
    constructor(pos: Vec2, scale: Vec2, t_index: number, z_coord: number) {
        super(scale, pos);
        this.object_tag = ObjectTag.Terrain;
        this.texture_index = t_index;
        this.z_coord = z_coord;
        this.collidable = false;
    }

    loop(delta_time: number): void {
        super.loop(delta_time);
        this.set_texture_coords(new Vec2(1, 1), new Vec2(0, 0));
    }
}
