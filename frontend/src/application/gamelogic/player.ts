import { renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { Obj, Quad } from "../../renderer/object";
import { DynamicGameObj } from "../base/gameobject";

export class Player extends DynamicGameObj {
    constructor() {
        super(new Vec2(100, 100), new Vec2(100, 100));
        const quad = new Quad([1, 1, 1]);
        this.object = new Obj(quad, renderer);
    }

    run(delta_time: number): void {
        super.run(delta_time);
    }
}