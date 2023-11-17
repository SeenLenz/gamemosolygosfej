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
    Wire,
    Debug,
    Melee0,
    Pisti,
    Ranged,
}

export function create_textures() {
    renderer.create_texture(
        "./textures/character/character_sprite_sheet.png",
        [
            [Vec2.zeros(), 14],
            [new Vec2(0, 1), 1],
            [new Vec2(1, 1), 4],
            [new Vec2(5, 1), 1],
            [new Vec2(6, 1), 1],
            [new Vec2(7, 1), 7],
            [new Vec2(0, 2), 10],
        ],
        new Vec2(14, 3)
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
            [new Vec2(1, 0), 1],
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
        "./textures/effects/dash-sheet.png",
        [[Vec2.zeros(), 7]],
        new Vec2(7, 1)
    );
    renderer.create_texture(
        "./textures/map/street_lamp.png",
        [[Vec2.zeros(), 1]],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/lamp_light.png",
        [[Vec2.zeros(), 1]],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/bench.png",
        [[Vec2.zeros(), 1]],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/house.png",
        [[Vec2.zeros(), 1]],
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
    renderer.create_texture(
        "./textures/map/wire.png",
        [[Vec2.zeros(), 5]],
        new Vec2(5, 1)
    );
    renderer.create_texture(
        "./textures/debug.png",
        [[Vec2.zeros(), 1]],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/effects/melee0.png",
        [[Vec2.zeros(), 7]],
        new Vec2(7, 1)
    );
    renderer.create_texture(
        "./textures/character/pistihanemdolgozik.png",
        [
            [Vec2.zeros(), 1],
            [new Vec2(1, 0), 6],
        ],
        new Vec2(7, 1)
    );
    renderer.create_texture(
        "./textures/effects/ranged.png",
        [[Vec2.zeros(), 7]],
        new Vec2(7, 1)
    );
}
