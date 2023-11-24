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
import { Type, Roles, Networkable } from "../../types";
import { WorkerMsg } from "./networking/WorkerMsg";
import { Network } from "./networking/networking";
import { GameObject } from "./application/base/gameobject";
import { Effect } from "./application/base/effects";
import {
    GamepadButtons,
    GamepadEvent,
} from "./application/base/gamepad_handler";
import { Hud } from "./ui/hud";

export const Gameped = new GamepadEvent();
export const RemoteBuff = new Map<String, Networkable>();
export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.5;
//export const network = new Network("10.0.23.4:3000");
//export const network = new Network("127.0.0.1:6969");
export const network = new Network("gamemosolygosfej.onrender.com");
export let delta_time: number = 1;
export let current_role: Roles;
let start = 1;
export let huuud: Hud;
export let map: Map_;
export let player: Player;

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#join_bt")?.addEventListener("click", (e) => {
        const joinLabelValue = (
            document.querySelector("#input_field") as HTMLInputElement | null
        )?.value;
        if (joinLabelValue) {
            network.join_lobby(joinLabelValue);
        }
    });
    document.querySelector("#start_bt")?.addEventListener("click", (e) => {
        document
            .querySelector(".startup")
            ?.setAttribute("style", "display: none;");
        document
            .querySelector(".ui")
            ?.setAttribute("style", "pointer-events: none;");
        document.querySelector("#start_bt")?.remove();

        network.send(new WorkerMsg(Type.start));
    });
    document.querySelector("#create_bt")?.addEventListener("click", (e) => {
        network.create_lobby();
    });
});

function setup(role: number) {
    document.querySelector("#start_bt")?.remove();
    document.querySelector("#msg_bt")?.remove();
    document.querySelector("#create_bt")?.remove();
    document.querySelector("#join_bt")?.remove();
    renderer.setup();
    create_textures();
    current_role = role;

    player = new Player([96, 96], [100, -500], false, undefined);
    camera.focus_on(player);

    start = performance.now();
    map = new Map_();
}

function main_loop() {
    huuud.run();
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
    Map_.foreground.forEach((obj) => {
        obj.loop(delta_time);
        obj.render();
    });

    network.flush();

    event.refresh();
    requestAnimationFrame(main_loop);
}

export function main(role: number) {
    setup(role);
    huuud = new Hud();
    main_loop();
}
