import { Renderer } from "../renderer/renderer.js";
import { Obj, quad } from "../renderer/object.js";
import { EventHandler } from "./event_handler.js";
import { DynamicGameObj, GameObject, StaticGameObj } from "./gameobject.js";
import { Border, Box, Player } from "./player.js";
import { Camera } from "./camera.js";

export const renderer = new Renderer();
export const eventHandler = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.31;

let start = 1;

export function setup() {
    renderer.setup();
    new Player();
    for (let i = 0; i < 3; i ++) {
        new Box([50, 1000], [camera.width / 3 * i + 500, Math.random() * (500) - 500]);
    }
    new Border([renderer.canvas.width / camera.scale, 20], [0, -500])
    new Border([renderer.canvas.width / camera.scale, 20], [0, 1000])
}

export function main_loop() {
    const delta_time = (performance.now() - start) / 1000.;
    start = performance.now();
    renderer.run(camera.convert());


    GameObject.objects.forEach(obj => {
        obj.run();

        obj.object.render(renderer);
    });
    requestAnimationFrame(main_loop)
}
