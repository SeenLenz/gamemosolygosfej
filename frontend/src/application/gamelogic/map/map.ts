import { camera } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { GameObject, StaticGameObj } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { Bela } from "../roles/player/enemies/slime";
import { Ground, GroundPos, UnderGround } from "./ground";
import { Bench, House, StreetLamp, Wire } from "./objects";

export class Map_ {
    background: GameObject[] = [];
    objects: GameObject[] = [];
    foreground: GameObject[] = [];
    constructor() {
        this.create_house(new Vec2(3, 0), new Vec2(21, 30), 1);
        this.create_house(new Vec2(3 + 26, -1), new Vec2(13, 30 + 1), 0.9);
        this.create_house(new Vec2(3 - 13, -3), new Vec2(13, 30 + 2), 0.7);
    }

    create_house(pos: Vec2, size: Vec2, z: number) {
        this.objects = this.objects.concat(
            new Ground(
                new Vec2(size.x, 1),
                new Vec2(0 + pos.x, 0 + pos.y),
                GroundPos.Center,
                z
            ),
            new Ground(
                new Vec2(1, 1),
                new Vec2(-1 + pos.x, 0 + pos.y),
                GroundPos.LeftCorner,
                z
            ),
            new Ground(
                new Vec2(1, 1),
                new Vec2(size.x + pos.x, 0 + pos.y),
                GroundPos.RightCorner,
                z
            ),
            new UnderGround(
                new Vec2(size.x, size.y),
                new Vec2(0 + pos.x, 1 + pos.y),
                GroundPos.Center,
                z
            ),
            new UnderGround(
                new Vec2(1, size.y),
                new Vec2(-1 + pos.x, 1 + pos.y),
                GroundPos.LeftCorner,
                z
            ),
            new UnderGround(
                new Vec2(1, size.y),
                new Vec2(size.x + pos.x, 1 + pos.y),
                GroundPos.RightCorner,
                z
            )
        );
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
