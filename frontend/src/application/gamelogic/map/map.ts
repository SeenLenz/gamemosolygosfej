import { camera } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { GameObject, StaticGameObj } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { Bela } from "../roles/player/enemies/slime";
import { Ground, GroundPos, UnderGround } from "./ground";
import { Bench, House, StreetLamp, Wire } from "./objects";

export class Map {
    background: GameObject[] = [];
    objects: GameObject[] = [];
    foreground: GameObject[] = [];
    constructor() {
        this.objects = [];
    }

    generate_map() {}

    render(delta_time: number) {
        this.background.forEach((obj) => {
            obj.loop(delta_time);
            obj.render();
        });
        this.objects.forEach((obj) => {
            obj.loop(delta_time);
            obj.render();
        });
    }
}
