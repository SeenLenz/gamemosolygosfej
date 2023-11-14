import { Renderer } from "./renderer/renderer";
import { EventHandler } from "./application/base/event_handler";
import { Camera } from "./application/base/camera";
import { Player } from "./application/gamelogic/player";
import { Map } from "./application/gamelogic/map/map";
import { create_textures } from "./application/base/textures";
import { Type, Test, WorkerMsg, Roles } from "../../types";
import { Network } from "./networking/networking";
import { Observer, PlayerRole, Role } from "./application/gamelogic/roles/role";
import { GameObject } from "./application/base/gameobject";

export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.5;
export const network = new Network("127.0.0.1:3000");
export let current_role: Role;
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
        network.send({
            type: Type.test,
            cid: network.ws_cfg?.cid,
            id: network.ws_cfg?.id,
            data: { msg: "hello from the frontend" } as Test,
        });
    });
});

function setup(role: number) {
    renderer.setup();
    create_textures();

    if (role == Roles.player) {
        current_role = new PlayerRole();
    } else {
        current_role = new Observer();
    }

    start = performance.now();
    map = new Map();
}

function main_loop() {
    const delta_time = (performance.now() - start) / 10;
    start = performance.now();
    renderer.run(camera);
    camera.move(delta_time);
    camera.shake_camera(delta_time);
    map.render(delta_time);

    current_role.run(delta_time);
    map.foreground.forEach((obj) => {
        obj.run(delta_time);
        obj.render();
    });

    if (current_role.type) {
        network.flush();
    }

    event.refresh();
    requestAnimationFrame(main_loop);
}

export function main(role: number) {
    setup(role);

    main_loop();
}
