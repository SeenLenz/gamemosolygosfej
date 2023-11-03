import { renderer } from "../../app";
import { Vec2 } from "../../lin_alg";

export enum SpriteSheets {
    Player,
    Ground,
    GroundCorners,
    UnderGround,
    GroundedEffect,
    DashEffect,
    SteetLamp,
    LampLightEffect,
    Bench,
    HouseFg,
    Background,
}

export function create_textures() {
    renderer.create_texture(
        "./textures/character/character_sprite_sheet.png",
        [
            [Vec2.zeros(), 8],
            [new Vec2(0, 1), 1],
            [new Vec2(1, 1), 1],
            [new Vec2(2, 1), 1],
            [new Vec2(3, 1), 1],
            [new Vec2(4, 1), 1],
        ],
        new Vec2(8, 2)
    );
    renderer.create_texture(
        "./textures/map/map.png",
        [[Vec2.zeros(), 1]],
        new Vec2(4, 1)
    );
    renderer.create_texture(
        "./textures/map/corners.png",
        [
            [Vec2.zeros(), 1],
            [new Vec2(1, 0), 1]
        ],
        new Vec2(2, 1)
    );
    renderer.create_texture(
        "./textures/map/underground.png",
        [[Vec2.zeros(), 1]],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/effects/grounded.png",
        [[Vec2.zeros(), 6]],
        new Vec2(6, 1)
    );
    renderer.create_texture(
        "./textures/effects/dash.png",
        [[Vec2.zeros(), 12]],
        new Vec2(12, 1)
    );
    renderer.create_texture(
        "./textures/map/street_lamp.png",
        [
            [Vec2.zeros(), 1],
        ],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/lamp_light.png",
        [
            [Vec2.zeros(), 1],
        ],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/bench.png",
        [
            [Vec2.zeros(), 1],
        ],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/house.png",
        [
            [Vec2.zeros(), 1],
        ],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/background/panels.png",
        [
            [Vec2.zeros(), 1],
            [new Vec2(1, 0), 1],
            [new Vec2(2, 0), 1],
        ],
        new Vec2(3, 1)
    );
}