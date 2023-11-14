import {
    CameraSync,
    Lobby,
    NetworkRenderable,
    Type,
    WorkerMsg,
} from "../../../../../types";
import { camera, network, renderer } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { Camera } from "../../base/camera";
import { Effect } from "../../base/effects";
import { GameObject } from "../../base/gameobject";
import { Player } from "../player";
import { Renderable } from "../../../renderer/object";

export interface Role {
    run(delta_time: number): void;
}

export class PlayerRole implements Role {
    constructor() {
        camera.focus_on(new Player([96, 96], [100, -500]));
    }

    run(delta_time: number) {
        let i = 0;
        GameObject.objects.forEach((go) => {
            go.run(delta_time);
            go.render();
            i++;
        });

        Effect.effects.forEach((e) => {
            e.animate();
        });
    }
}

export class Observer implements Role {
    camera: {
        pos: Vec2;
        scale: number;
        rotation: number;
    };
    texture_buffer: { buffer: WebGLBuffer; attribute: number };
    texture_coords = new Float32Array(8);
    base_obj = renderer.base_quad_obj;
    objects: Renderable[] = [];
    constructor() {
        this.camera = {
            pos: new Vec2(0, -500),
            scale: 1,
            rotation: 0,
        };
        this.texture_buffer = renderer.create_buffer(
            renderer.gl.DYNAMIC_DRAW,
            this.texture_coords,
            "texture_coord"
        );
        camera.pos.y = this.camera.pos.y;
    }

    run(delta_time: number) {}
}
