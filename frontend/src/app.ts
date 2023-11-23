import { Renderer } from "./renderer/renderer";
import {
    EventHandler,
    EventType,
    Keys,
} from "./application/base/event_handler";
import { Camera } from "./application/base/camera";
import { Player } from "./application/gamelogic/player";
import { Map_ } from "./application/gamelogic/map/map";
import { create_textures } from "./application/base/textures";
import { Type, Roles, Networkable, Start } from "../../types";
import { WorkerMsg } from "./networking/WorkerMsg";
import { Network } from "./networking/networking";
import { GameObject } from "./application/base/gameobject";
import { Effect } from "./application/base/effects";
import { Hud } from "./ui/hud";
import { StartScreen } from "./ui/start";

export const RemoteBuff = new Map<String, Networkable>();
export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.5;
//export const network = new Network("10.0.23.4:3000");
export const network = new Network("127.0.0.1:6969");
// export const network = new Network("gamemosolygosfej.onrender.com");
export let delta_time: number = 1;
export let current_role: Roles;
let start = 1;
let hud: Hud;
let canvas_start: StartScreen;

export let map: Map_;

document.addEventListener("DOMContentLoaded", () => {    
    canvas_start = new StartScreen();
    canvas_start.run();    
});

function setup(role: number) {
    document.querySelector("#start_bt")?.remove();
    document.querySelector("#msg_bt")?.remove();
    document.querySelector("#create_bt")?.remove();
    document.querySelector("#join_bt")?.remove();
    renderer.setup();
    create_textures();
    current_role = role;

    camera.focus_on(new Player([96, 96], [100, -500], false, undefined));

    start = performance.now();
    map = new Map_();
    hud = new Hud();
}

function main_loop() {
    delta_time = (performance.now() - start) / 10;
    start = performance.now();
    renderer.run(camera);
    camera.move(delta_time);
    camera.shake_camera(delta_time);
    map.render(delta_time);

    GameObject.objects.forEach((go) => {
        go.loop(delta_time);
        go.render();
    });
    Effect.effects.forEach((e) => {
        e.animate();
    });
    map.foreground.forEach((obj) => {
        obj.loop(delta_time);
        obj.render();
    });

    network.flush();
    hud.run();
    event.refresh();
    requestAnimationFrame(main_loop);
}

export function main(role: number) {
    setup(role);

    main_loop();
}
