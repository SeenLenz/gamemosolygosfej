import { camera } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { GameObject, StaticGameObj } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { Slime } from "../roles/player/enemies/slime";
import { Ground, GroundPos, UnderGround } from "./ground";
import { Bench, House, StreetLamp, Wire } from "./objects";

export class Map {
    background: GameObject[] = [];
    objects: GameObject[] = [];
    foreground: GameObject[] = [];
    constructor() {
        this.objects = [
            new House(
                new Vec2(64 * 6, 64 * 6),
                new Vec2(5 * 48, 0 - 64 * 6 + 3 * 6)
            ),
            // new Ground(new Vec2(1, 8), new Vec2(12, -8), GroundPos.Center),
            // new Ground(new Vec2(1, 8), new Vec2(0, -8), GroundPos.Center),
            // new Ground(new Vec2(8, 1), new Vec2(1, -14), GroundPos.Center),
            new Ground(new Vec2(40, 1), new Vec2(0, 0), GroundPos.Center),
            new Ground(new Vec2(1, 1), new Vec2(-1, 0), GroundPos.LeftCorner),
            new Ground(new Vec2(1, 1), new Vec2(40, 0), GroundPos.RightCorner),
            new UnderGround(new Vec2(42, 20), new Vec2(-1, 1)),

            new StreetLamp(
                new Vec2(12 * 6, 48 * 6),
                new Vec2(18 * 48 - 24 * 6 + 300, 0 - 48 * 6 + 3 * 6 + 4 * 6)
            ),

            new Bench(
                new Vec2(16 * 6, 8 * 6),
                new Vec2(30 * 48, 0 - 8 * 6 + 3 * 6)
            ),
        ];
    }

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

class Background extends StaticGameObj {
    constructor(size: Vec2, pos: Vec2, z: number) {
        super(size, pos, false, false);
        this.texture_index = SpriteSheets.Background;
        this.sprite_index = Math.floor(Math.random() * 3);
        this.z_coord = z;
        this.set_texture_coords(
            new Vec2(this.sprite_size.x, 1),
            new Vec2(0, 0)
        );
    }

    loop(delta_time: number) {
        super.loop(delta_time);
    }
}
