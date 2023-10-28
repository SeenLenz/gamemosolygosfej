import { Renderer } from "./renderer/renderer";
import { EventHandler, EventType, Keys } from "./application/base/event_handler";
import { GameObject } from "./application/base/gameobject";
import { Camera } from "./application/base/camera";
import { Player } from "./application/gamelogic/player";
import { Vec2 } from "./lin_alg";

document.addEventListener("DOMContentLoaded", () => {
    main();
});

export const renderer = new Renderer();
export const eventHandler = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.2;
export let air_density = 1.204;

let start = 1;

function setup() {
    renderer.setup();
    new Player();
}

function main_loop() {
    const delta_time = (performance.now() - start) / 10.;
    start = performance.now();
    renderer.run(camera.convert());
    
    GameObject.objects.forEach(obj => {
        obj.run(delta_time);
    });

    eventHandler.refresh();
    requestAnimationFrame(main_loop)
}

function main() {
    setup();

    main_loop();
}
