import { Renderer } from "./renderer/renderer";
import {
    EventHandler,
    EventType,
    Keys,
} from "./application/base/event_handler";
import { Camera } from "./application/base/camera";
import { Player } from "./application/gamelogic/player";
import { Map } from "./application/gamelogic/map/map";
import { create_textures } from "./application/base/textures";
import { Type, Test, WorkerMsg } from "../../types";
import { Network } from "./networking/networking";
import { PlayerRole, Role } from "./application/gamelogic/roles/role";

export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.5;
export const network = new Network("127.0.0.1:3000");
export let delta_time: number = 1;
let start = 1;

export let map: Map;

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#join_bt")?.addEventListener("click", (e) => {
        const joinLabelValue = (
            document.querySelector("#join_label") as HTMLInputElement | null
        )?.value;
        if (joinLabelValue) {
            network.join_lobby(joinLabelValue);
        }
    });
    document.querySelector("#start_bt")?.addEventListener("click", (e) => {
        network.send({
            ...network.ws_cfg,
            type: Type.start,
        } as WorkerMsg);
    });
    document.querySelector("#create_bt")?.addEventListener("click", (e) => {
        network.create_lobby();
    });
    document.querySelector("#msg_bt")?.addEventListener("click", (e) => {
        console.log("asdfasd" + network.domain);
        network.send({
            type: Type.test,
            cid: network.ws_cfg?.cid,
            id: network.ws_cfg?.id,
            data: { msg: "hello from the frontend" } as Test,
        });
    });

    main();
});

let current_role: Role;

function setup() {
    renderer.setup();
    create_textures();
    current_role = new PlayerRole();
    map = new Map();
    start = performance.now();
}

function main_loop() {
    delta_time = (performance.now() - start) / 10;
    start = performance.now();
    renderer.run(camera);
    camera.move(delta_time);
    camera.shake_camera(delta_time);
    map.render(delta_time);

    current_role.render(delta_time);
    map.foreground.forEach((obj) => {
        obj.loop(delta_time);
        obj.render();
    });

    event.refresh();
    setTimeout(() => requestAnimationFrame(main_loop), 100);
}

function main() {
    setup();

    main_loop();
}
