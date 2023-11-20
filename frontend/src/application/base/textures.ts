import { renderer } from "../../app";
import { Vec2 } from "../../lin_alg";

export enum SpriteSheets {
    Player,
    Ground,
    GroundCorners,
    UnderGround,
    SteetLamp,
    LampLightEffect,
    Bench,
    HouseFg,
    Background,
    Wire,
    Debug,
    Pisti,
    PlayerEffects,
    SlimeEnemy,
    SmallSlimeEnemy,
    RangedEnemy,
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
        "./textures/character/pistihanemdolgozik.png",
        [
            [Vec2.zeros(), 1],
            [new Vec2(1, 0), 6],
        ],
        new Vec2(7, 1)
    );

    renderer.create_texture(
        "./textures/effects/effects.png",
        [
            [Vec2.zeros(), 7],
            [Vec2.Y(1), 7],
            [Vec2.Y(2), 6],
            [Vec2.Y(3), 7],
            [Vec2.Y(4), 7],
            [Vec2.Y(5), 7],
        ],
        new Vec2(7, 6)
    );

    renderer.create_texture(
        "./textures/enemies/slime.png",
        [
            [Vec2.zeros(), 1],
            [Vec2.X(1), 2],
            [Vec2.X(3), 1],
            [Vec2.X(4), 2],
            [Vec2.X(6), 3],
            [new Vec2(0, 1), 10],
        ],
        new Vec2(10, 2)
    );

    renderer.create_texture(
        "./textures/enemies/small_slime.png",
        [
            [Vec2.zeros(), 1],
            [Vec2.X(1), 2],
            [Vec2.X(3), 1],
            [Vec2.X(4), 2],
            [Vec2.X(6), 3],
            [new Vec2(0, 1), 7],
        ],
        new Vec2(9, 2)
    );

    renderer.create_texture(
        "./textures/enemies/huba.png",
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
        "./textures/map/map_sheet.png",
        [
            [Vec2.zeros(), 1],
            [new Vec2(0, 1), 1],
            [new Vec2(1, 1), 4],
            [new Vec2(5, 1), 1],
            [new Vec2(6, 1), 1],
            [new Vec2(7, 1), 7],
            [new Vec2(0, 2), 10],
        ],
        new Vec2(14, 3)
    );
}
