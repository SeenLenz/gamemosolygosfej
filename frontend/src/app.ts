import { Renderer } from "./renderer/renderer";
import { EventHandler } from "./application/base/event_handler";
import { GameObject } from "./application/base/gameobject";
import { Camera } from "./application/base/camera";
import { Player } from "./application/gamelogic/player";
import { Vec2 } from "./lin_alg";
import { Terrain } from "./application/gamelogic/terrain";

document.addEventListener("DOMContentLoaded", () => {
    main();
});

export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.8;
let start = 1;

function setup() {
    renderer.setup();
    camera.focus_multip = 0.03;
    camera.focus_on(new Player([128, 128], [camera.center.x, camera.center.y]));
    let player = new Player([64, 64], [camera.center.x + 200, camera.center.y]);
    player.focused = false;
    new Terrain(camera.zero.add(new Vec2(0, camera.height - 60)), new Vec2(camera.width, 30));
    new Terrain(camera.zero.add(new Vec2(500, camera.height - 60 - 150)), new Vec2(300, 150));
}

function main_loop() {
    const delta_time = (performance.now() - start) / 10.;
    start = performance.now();
    renderer.run(camera);
    camera.move(delta_time);
    
    GameObject.objects.forEach(go => {
        go.run(delta_time);
        go.render();
    });

    event.refresh();
    requestAnimationFrame(main_loop)
}

function main() {
    setup();

    main_loop();
}
