import { Renderer } from "./renderer/renderer";
import { EventHandler, EventType, Keys } from "./application/base/event_handler";
import { GameObject } from "./application/base/gameobject";
import { Camera } from "./application/base/camera";
import { Player } from "./application/gamelogic/player";
import { Vec2 } from "./lin_alg";
import { Terrain } from "./application/gamelogic/terrain";

document.addEventListener("DOMContentLoaded", () => {
    main();
});

export const renderer = new Renderer();
export const eventHandler = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.5;
export let air_density = 1.204;

let start = 1;

function setup() {
    renderer.setup();
    new Player();
    new Terrain(camera.zero.add(new Vec2(0, camera.height - 20)), new Vec2(camera.width, 20))
    new Terrain(camera.zero, new Vec2(20, camera.height));
    new Terrain(camera.zero.add(new Vec2(camera.width - 20, 0)), new Vec2(20, camera.height));
}

function main_loop() {
    const delta_time = (performance.now() - start) / 10.;
    start = performance.now();
    renderer.run(camera.convert());
    
    GameObject.objects.forEach(go => {
        go.run(delta_time);
        go.render();
    });

    eventHandler.refresh();
    requestAnimationFrame(main_loop)
}

function main() {
    setup();

    main_loop();
}
