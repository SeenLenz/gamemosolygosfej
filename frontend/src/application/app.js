import { Renderer } from "../renderer/renderer.js";
import { Obj, quad } from "../renderer/object.js";
import { EventHandler } from "./event_handler.js";
import { DynamicGameObj, GameObject, StaticGameObj } from "./gameobject.js";
import { Box, DBox, DBox2, Wall } from "./player.js";
import { Camera } from "./camera.js";

export const renderer = new Renderer();
export const eventHandler = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.981;

let start = 1;

export function setup() {
    renderer.setup();
    new Box();
    new DBox();
    new DBox2();
    new Wall();

}

export function main_loop() {
    const delta_time = (performance.now() - start) / 10.;
    start = performance.now();
    renderer.run(camera.convert());


    GameObject.objects.forEach(obj => {
        obj.run(delta_time);

        obj.object.render(renderer);
    });
    requestAnimationFrame(main_loop)
}
