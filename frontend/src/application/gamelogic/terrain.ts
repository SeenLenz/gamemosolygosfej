import { Vec2 } from "../../lin_alg";
import { ObjectTag, StaticGameObj } from "../base/gameobject";

export class Terrain extends StaticGameObj {
    constructor(pos: Vec2, scale: Vec2) {
        super(scale, pos);
        this.object_tag = ObjectTag.Terrain;
        this.texture_index = 1;
    }

    run(delta_time: number): void {
        super.run(delta_time);
        this.set_texture_coords(new Vec2(this.size.x / this.size.y / 2, 1), new Vec2(0, 0));
    }
}