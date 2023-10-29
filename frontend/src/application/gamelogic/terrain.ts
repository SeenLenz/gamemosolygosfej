import { Vec2 } from "../../lin_alg";
import { ObjectTag, StaticGameObj } from "../base/gameobject";

export class Terrain extends StaticGameObj {
    constructor(pos: Vec2, scale: Vec2) {
        super(scale, pos);
        this.object_tag = ObjectTag.Terrain;
    }
}