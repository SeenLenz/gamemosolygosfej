import { Lobby, NetworkRenderable, WorkerMsg } from "../../../../../types";
import { event } from "../../../app";
import { Effect } from "../../base/effects";
import { EventType, Keys } from "../../base/event_handler";
import { GameObject } from "../../base/gameobject";

export interface Role {
    render(delta_time: number): void;
}

export class PlayerRole implements Role {
    constructor() {}

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

export class EvilRole implements Role {
    network_renderer: NetworkRenderable[] = [];
    constructor() {}

    render(delta_time: number) {}
}
