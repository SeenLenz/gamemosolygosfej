import { Lobby, NetworkRenderable, WorkerMsg } from "../../../../../types";
import { camera, network } from "../../../app";
import { Effect } from "../../base/effects";
import { GameObject } from "../../base/gameobject";
import { Player } from "../player";

export interface Role {
    render(delta_time: number): void;
}

export class PlayerRole implements Role {
    constructor() {
        camera.focus_on(new Player([96, 96], [100, -500]));
    }

    render(delta_time: number) {
        GameObject.objects.forEach((go) => {
            go.run(delta_time);
            go.render();
        });

        Effect.effects.forEach((e) => {
            e.animate();
        });
    }
}

export class Observer implements Role {
    network_renderer: NetworkRenderable[] = [];
    constructor() {}

    render(delta_time: number) {}
}
