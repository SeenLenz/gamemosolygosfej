import { camera, renderer } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { GameObject, StaticGameObj } from "../../base/gameobject";
import { Point } from "../../base/rays";
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

const map_sprite_size = Vec2.uniform(1).div(
    renderer.textures[SpriteSheets.House].max_sprites
);

class DesignTexture {
    pos: Vec2;
    size: Vec2;
    rotation: number = 0;
    x_direction: number = 1;
    texture_buffer: { buffer: WebGLBuffer; attribute: number };
    texture_index: number = SpriteSheets.House;
    z_coord: number = 1;
    texture_coords: Float32Array;
    constructor(pos: Point, size: Point) {
        this.texture_coords = new Float32Array(8);
        this.texture_buffer = renderer.create_buffer(
            renderer.gl.STATIC_DRAW,
            this.texture_coords,
            "texture_coord"
        );
    }
}

class MapObj {
    objs: StaticGameObj[] = [];
    constructor() {}

    static House(dimensions: Point) {
        let mapobj = new MapObj();
    }
}
