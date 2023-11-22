import {
    CameraSync,
    Lobby,
    NetworkRenderable,
    Roles,
    Type,
} from "../../../../../types";
import { camera, network, renderer } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { Camera } from "../../base/camera";
import { Effect } from "../../base/effects";
import { GameObject } from "../../base/gameobject";
import { Player } from "../player";
import { Renderable } from "../../../renderer/object";
import { CameraObj } from "./observer/camera";
import { Pisti } from "./player/enemies/pisti";
import { Bela } from "./player/enemies/slime";
import { Huba } from "./player/enemies/ranged";

export interface Role {
    run(delta_time: number): void;
    type?: Roles;
}

export let player: Player;

export class PlayerRole implements Role {
    type: Roles;

    constructor() {
        //        camera.focus_on(new Player([96, 96], [100, -500], false));
        this.type = Roles.player;
    }

    run(delta_time: number) {
        let i = 0;
        GameObject.objects.forEach((go) => {
            go.loop(delta_time);
            go.render();
            network.outBuff_add({
                id: network.ws_cfg?.id,
                cid: network.ws_cfg?.cid,
                type: Type.dynamic_game_object,
                data: {
                    index: i,
                    pos: go.pos,
                    size: go.size,
                    rotation: go.rotation,
                    x_direction: go.x_direction,
                    texture_index: go.texture_index,
                    texture_coords: go.texture_coords,
                    z_coord: go.z_coord,
                },
            });
            i++;
        });

        Effect.effects.forEach((e) => {
            e.animate();
        });

        network.outBuff_add({
            id: network.ws_cfg?.id,
            cid: network.ws_cfg?.cid,
            type: Type.camera,
            data: {
                pos: camera.pos,
                scale: camera.scale,
                rotation: camera.rotation,
            },
        });

        network.flush();
    }
}

export class Observer implements Role {
    texture_buffer: { buffer: WebGLBuffer; attribute: number };
    texture_coords = new Float32Array(8);
    base_obj = renderer.base_quad_obj;
    objects: Renderable[] = [];
    cam_obj = new CameraObj();
    constructor() {
        camera.focus_on(this.cam_obj);
        this.texture_buffer = renderer.create_buffer(
            renderer.gl.DYNAMIC_DRAW,
            this.texture_coords,
            "texture_coord"
        );
    }

    run(delta_time: number) {
        //        const data = network.data;
        // if ("types" in data) {
        //     this.objects.forEach((obj) => {
        //         renderer.gl.bindBuffer(
        //             renderer.gl.ARRAY_BUFFER,
        //             this.texture_buffer.buffer
        //         );
        //         this.texture_coords = new Float32Array([
        //             obj.texture_coords[0],
        //             obj.texture_coords[1],
        //             obj.texture_coords[2],
        //             obj.texture_coords[3],
        //             obj.texture_coords[4],
        //             obj.texture_coords[5],
        //             obj.texture_coords[6],
        //             obj.texture_coords[7],
        //         ]);
        //         renderer.gl.bufferSubData(
        //             renderer.gl.ARRAY_BUFFER,
        //             0,
        //             this.texture_coords
        //         );
        //         this.base_obj?.render(renderer, obj);
        //     });
        //     data.data.forEach((e, i) => {
        //         switch (data.types[i]) {
        //             case Type.dynamic_game_object:
        //                 const render_info = e.data as NetworkRenderable;
        //                 if (render_info.index >= this.objects.length) {
        //                     this.objects.push({
        //                         pos: render_info.pos as Vec2,
        //                         size: render_info.size as Vec2,
        //                         rotation: render_info.rotation as number,
        //                         x_direction: render_info.x_direction as number,
        //                         texture_buffer: this.texture_buffer,
        //                         texture_index:
        //                             render_info.texture_index as number,
        //                         z_coord: render_info.z_coord as number,
        //                         texture_coords:
        //                             render_info.texture_coords as Float32Array,
        //                     });
        //                 } else {
        //                     if (render_info.velocity) {
        //                         let dy;
        //                         this.objects[render_info.index] = {
        //                             pos: render_info.pos as Vec2,
        //                             size: render_info.size as Vec2,
        //                             rotation: render_info.rotation as number,
        //                             x_direction:
        //                                 render_info.x_direction as number,
        //                             texture_buffer: this.texture_buffer,
        //                             texture_index:
        //                                 render_info.texture_index as number,
        //                             z_coord: render_info.z_coord as number,
        //                             texture_coords:
        //                                 render_info.texture_coords as Float32Array,
        //                         };
        //                     }
        //                     this.objects[render_info.index] = {
        //                         pos: render_info.pos as Vec2,
        //                         size: render_info.size as Vec2,
        //                         rotation: render_info.rotation as number,
        //                         x_direction: render_info.x_direction as number,
        //                         texture_buffer: this.texture_buffer,
        //                         texture_index:
        //                             render_info.texture_index as number,
        //                         z_coord: render_info.z_coord as number,
        //                         texture_coords:
        //                             render_info.texture_coords as Float32Array,
        //                     };
        //                 }
        //                 break;
        //         }
        //     });
        // } else {
        //     this.objects.forEach((obj) => {
        //         renderer.gl.bindBuffer(
        //             renderer.gl.ARRAY_BUFFER,
        //             this.texture_buffer.buffer
        //         );
        //         this.texture_coords = new Float32Array([
        //             obj.texture_coords[0],
        //             obj.texture_coords[1],
        //             obj.texture_coords[2],
        //             obj.texture_coords[3],
        //             obj.texture_coords[4],
        //             obj.texture_coords[5],
        //             obj.texture_coords[6],
        //             obj.texture_coords[7],
        //         ]);
        //         renderer.gl.bufferSubData(
        //             renderer.gl.ARRAY_BUFFER,
        //             0,
        //             this.texture_coords
        //         );
        //         this.base_obj?.render(renderer, obj);
        //     });
        //     switch (data.type) {
        //         case Type.camera:
        //             const camerasync = data.data as CameraSync;
        //             camera.pos = camerasync.pos;
        //             camera.rotation = camerasync.rotation;
        //             camera.scale = camerasync.scale;
        //             break;
        //         case Type.dynamic_game_object:
        //             const render_info = data.data as NetworkRenderable;
        //             if (render_info.index >= this.objects.length) {
        //                 this.objects.push({
        //                     pos: render_info.pos as Vec2,
        //                     size: render_info.size as Vec2,
        //                     rotation: render_info.rotation as number,
        //                     x_direction: render_info.x_direction as number,
        //                     texture_buffer: this.texture_buffer,
        //                     texture_index: render_info.texture_index as number,
        //                     z_coord: render_info.z_coord as number,
        //                     texture_coords:
        //                         render_info.texture_coords as Float32Array,
        //                 });
        //             } else {
        //                 this.objects[render_info.index] = {
        //                     pos: render_info.pos as Vec2,
        //                     size: render_info.size as Vec2,
        //                     rotation: render_info.rotation as number,
        //                     x_direction: render_info.x_direction as number,
        //                     texture_buffer: this.texture_buffer,
        //                     texture_index: render_info.texture_index as number,
        //                     z_coord: render_info.z_coord as number,
        //                     texture_coords:
        //                         render_info.texture_coords as Float32Array,
        //                 };
        //             }
        //             break;
        //     }
        // }
    }
}
