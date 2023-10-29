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
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.8;

let players: Player[];
let focus_ind = 0;
let start = 1;

function setup() {
    renderer.setup();
    players = [
        new Player(),
        new Player(),
    ];

    
    players[0].focused = true;
    
    camera.focus_on(players[focus_ind]);
    new Terrain(camera.zero.add(new Vec2(camera.width / 4 - 20, camera.height - 20)), new Vec2(camera.width / 2, 20));
    new Terrain(camera.zero.add(new Vec2(camera.width / 2 - camera.width / 6 / 2, camera.height / 10 * 8 - 20)), new Vec2(camera.width / 10, 20));
    new Terrain(camera.zero.add(new Vec2(camera.width / 2 - camera.width / 6 * 2 / 2, camera.height / 10 * 7 - 20)), new Vec2(camera.width / 10, 20));
    new Terrain(camera.zero.add(new Vec2(camera.width / 2 - camera.width / 6 * 3 / 2, camera.height / 10 * 6 - 20)), new Vec2(camera.width / 10, 20));
    new Terrain(camera.zero.add(new Vec2(camera.width / 4 - 20, 0)), new Vec2(20, camera.height));
    new Terrain(camera.zero.add(new Vec2(camera.width / 4 * 3 - 20, 0)), new Vec2(20, camera.height));
}

function main_loop() {
    const delta_time = (performance.now() - start) / 10.;
    start = performance.now();
    renderer.run(camera.convert());
    camera.move(delta_time);

    if (event.key_state(Keys.Space, EventType.Pressed)) {
        players[0].focused = !players[0].focused;
        players[1].focused = !players[1].focused;   
        focus_ind = Math.abs(focus_ind - 1);
        camera.focus_on(players[focus_ind]);
    }
    
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
