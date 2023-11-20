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
import { Type, Test, Roles } from "../../types";
import { WorkerMsg } from "./networking/WorkerMsg";
import { Network } from "./networking/networking";
import { Observer, PlayerRole, Role } from "./application/gamelogic/roles/role";
import { GameObject } from "./application/base/gameobject";
import { Effect } from "./application/base/effects";

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
        network.send(new WorkerMsg(Type.start));
    });
    document.querySelector("#create_bt")?.addEventListener("click", (e) => {
        network.create_lobby();
    });
    document.querySelector("#msg_bt")?.addEventListener("click", (e) => {
        network.send(
            new WorkerMsg(Type.test, {
                msg: "This is a message from the test button",
            })
        );
    });
});

function setup(role: number) {
    renderer.setup();
    create_textures();
    current_role = role;

    if (role == Roles.player) {
        camera.focus_on(new Player([96, 96], [100, -500], false));
    } else {
        camera.focus_on(new Player([96, 96], [200, -500], false));
    }

    start = performance.now();
    map = new Map();
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

    event.refresh();
    requestAnimationFrame(main_loop);
}

export function main(role: number) {
    setup(role);

    main_loop();
}
