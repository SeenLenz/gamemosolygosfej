import { Renderer } from "../renderer/renderer.js";
import { Obj, quad } from "../renderer/object.js";
import { EventHandler } from "./event_handler.js";
import { DynamicGameObj, GameObject, StaticGameObj } from "./gameobject.js";
import { Box, Enemy, Player } from "./player.js";
import { Camera } from "./camera.js";

export const renderer = new Renderer();
export const eventHandler = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.31;


let start = 1;

export function setup() {
    renderer.setup();
    new Player();
    new Enemy([450, 300]);
    new StaticGameObj(renderer, [renderer.gl.canvas.width / 2, 100], [0, renderer.gl.canvas.height - 100], [0.3, 0.3,0.3], 100);
    new StaticGameObj(renderer, [renderer.gl.canvas.width / 2, 100], [renderer.gl.canvas.width / 2 - renderer.gl.canvas.width / 2, 0], [0.3, 0.3,0.3], 100);
    new StaticGameObj(renderer, [100, renderer.gl.canvas.height], [0, renderer.gl.canvas.height - renderer.gl.canvas.height], [0.3, 0.3,0.3], 100);
    new StaticGameObj(renderer, [100, renderer.gl.canvas.height], [renderer.gl.canvas.width / 2, 0], [0.3, 0.3,0.3], 100);
}

export function main_loop() {
    const delta_time = (performance.now() - start) / 1000.;
    start = performance.now();


    renderer.run(camera.convert());

    GameObject.objects.forEach(obj => {
        obj.run(delta_time);

        obj.object.render(renderer);
    });
    requestAnimationFrame(main_loop)
}
