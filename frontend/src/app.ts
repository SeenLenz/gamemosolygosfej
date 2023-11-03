import { Renderer } from "./renderer/renderer";
import { EventHandler } from "./application/base/event_handler";
import { GameObject } from "./application/base/gameobject";
import { Camera } from "./application/base/camera";
import { Player } from "./application/gamelogic/player";
import { Vec2 } from "./lin_alg";
import { Background, Terrain } from "./application/gamelogic/terrain";
import { Effect } from "./application/base/effects";
import { Map } from "./application/gamelogic/map/map";
import { create_textures } from "./application/base/textures";
import { Type, Test } from "../../types";
import { Network } from "./networking/networking";

export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.5;
export const network = new Network("127.0.0.1:3000");
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
    document.querySelector("#create_bt")?.addEventListener("click", (e) => {
        network.create_lobby();
    });
    document.querySelector("#msg_bt")?.addEventListener("click", (e) => {
        console.log("asdfasd" + network.domain);
        network.send({
            type: Type.test,
            cid: network.ws_cfg?.lobby.client_id,
            id: network.ws_cfg?.lobby.key,
            data: { msg: "hello from the frontend" } as Test,
        });
    });

    main();
});

function setup() {
    renderer.setup();
    create_textures();

    map = new Map();
    camera.focus_multip = 0.03;
    camera.focus_on(new Player([96, 96], [100, -500]));
}

function main_loop() {
    const delta_time = (performance.now() - start) / 10;
    start = performance.now();
    renderer.run(camera);
    camera.move(delta_time);
    map.render(delta_time);

    GameObject.objects.forEach((go) => {
        go.run(delta_time);
        go.render();
    });

    Effect.effects.forEach((e) => {
        e.animate();
    });

    map.foreground.forEach((obj) => {
        obj.run(delta_time);
        obj.render();
    });

    event.refresh();
    requestAnimationFrame(main_loop);
}

function main() {
    setup();

    main_loop();
}
