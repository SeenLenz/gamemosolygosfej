import { Renderer } from "./renderer/renderer";
import { EventHandler } from "./application/base/event_handler";
import { GameObject } from "./application/base/gameobject";
import { Camera } from "./application/base/camera";
import { Vec2 } from "./lin_alg";
import { Terrain } from "./application/gamelogic/terrain";
import { Effect } from "./application/base/effects";
import { Player } from "./application/gamelogic/player";

document.addEventListener("DOMContentLoaded", () => {
    main();
});

export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.1;

let start = 1;
const Pali = new Worker("./webworker/worker.ts");

export enum SpriteSheets {
    Player,
    Map,
    Ground,
    GroundedEffect,
    DashEffect,
    Background,
    OtherBackground,
}

function setup() {
    renderer.setup();
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
        new Vec2(1, 1)
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
        "./textures/map/background.png",
        [[Vec2.zeros(), 1]],
        new Vec2(1, 1)
    );
    renderer.create_texture(
        "./textures/map/background-1.png",
        [[Vec2.zeros(), 1]],
        new Vec2(1, 1)
    );

    camera.focus_multip = 0.03;

    new Terrain(
        camera.zero.add(new Vec2(0, camera.height)),
        new Vec2(Math.floor(camera.width / 48) * 48 * 4, 48),
        SpriteSheets.Map
    );
    new Terrain(
        camera.zero.add(new Vec2(0, camera.height + 48)),
        new Vec2(Math.floor(camera.width / 48) * 48 * 4, 48 * 10),
        SpriteSheets.Ground
    );
    camera.focus_on(new Player([96, 96], [camera.center.x, camera.center.y]));
}

function main_loop() {
    const delta_time = (performance.now() - start) / 10;
    start = performance.now();
    renderer.run(camera);
    camera.move(delta_time);

    GameObject.objects.forEach((go) => {
        go.run(delta_time);
        go.render();
    });

    Effect.effects.forEach((e) => {
        e.animate();
    });

    event.refresh();
    requestAnimationFrame(main_loop);
}

function main() {
    setup();

    main_loop();
}
