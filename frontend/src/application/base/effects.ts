import { Networkable, Type } from "../../../../types";
import { NetworkBuff, network, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { WorkerMsg } from "../../networking/WorkerMsg";
import { GameObject } from "./gameobject";
import { SpriteSheets } from "./textures";
import { v4 as uuid } from "uuid";

export type HaltPoint = {
    frame: number;
    time: number;
};

export enum PlayerEffects {
    Dash,
    MeleeC0,
    Grounded,
    Ranged,
    Teleport,
    MeleeC1,
}

export class Effect {
    size: Vec2 = Vec2.zeros();
    pos: Vec2 = Vec2.zeros();
    object = renderer.base_quad_obj;
    texture_buffer: { buffer: WebGLBuffer; attribute: number };
    texture_coords: Float32Array;
    texture_index: number;
    sprite_index: number = 0;
    x_direction: number = 1;
    current_frame = 0;
    animation_timer = 0;
    frame_time: number;
    repeat: number;
    current_cycle = 0;
    rotation = 0;
    z_coord = 1;
    reverse = 0;
    offset = Vec2.zeros();
    remote = false;
    parent_obj: String | undefined = undefined;
    velocity: Vec2 | undefined;
    auto_render = true;
    constructor(
        size: Vec2,
        pos: Vec2,
        x_dir: number,
        texure_index: SpriteSheets,
        effect: number,
        speed: number,
        repeat: number,
        offset: Vec2 = Vec2.zeros(),
        reverse = false,
        remote = false,
        parent_obj: String | undefined = undefined,
        sync = true,
        auto_render = true
    ) {
        this.x_direction = x_dir;
        this.texture_index = texure_index;
        this.sprite_index = effect;
        this.texture_coords = new Float32Array(8);
        this.texture_buffer = renderer.create_buffer(
            renderer.gl.STATIC_DRAW,
            this.texture_coords,
            "texture_coord"
        );
        this.frame_time = speed;
        this.repeat = repeat;
        this.size = size;
        this.pos = pos;
        this.offset = offset;
        this.remote = remote;
        this.parent_obj = parent_obj;
        this.auto_render = auto_render;

        if (!this.remote && sync) {
            let msg = new WorkerMsg(Type.crt, {
                effect: this.sprite_index,
                size: this.size,
                pos: this.pos,
                x_dir: this.x_direction,
                texure_index: this.texture_index,
                speed: this.frame_time,
                repeat: this.repeat,
                offset: this.offset,
                reverse: this.reverse,
                parent_obj: this.parent_obj,
            });

            network.outBuff_add(msg);
        }

        if (auto_render) {
            Effect.effects.push(this);
        }
    }

    get texture() {
        return renderer.textures[this.texture_index];
    }

    get sprite() {
        return this.texture.sprites[this.sprite_index];
    }

    get sprite_size() {
        return new Vec2(1, 1).div(this.texture.max_sprites);
    }

    get index() {
        return Effect.effects.findIndex((obj) => obj == this);
    }

    remove() {
        if (this.auto_render) {
            Effect.effects.splice(this.index, 1);
        }
    }

    static effects: Effect[] = [];

    animate() {
        if (this.remote) {
            if (this.parent_obj) {
                let r = NetworkBuff.get(this.parent_obj);
                if (r) {
                    this.pos = (r as any as GameObject).pos;
                }
            }
        }
        if (performance.now() - this.animation_timer > this.frame_time) {
            this.set_texture_coords(
                Vec2.from(this.sprite_size),
                new Vec2(
                    this.sprite[0].x + this.current_frame,
                    this.sprite[0].y
                )
            );

            this.animation_timer = performance.now();
            this.current_frame += 1;
            if (this.current_frame > this.sprite[1] - 1) {
                this.current_frame = 0;
                this.current_cycle += 1;
            }
        }
        this.object?.render(renderer, this, this.offset);
        if (
            this.repeat != -1 &&
            this.current_frame == 0 &&
            this.current_cycle >= this.repeat
        ) {
            this.remove();
        }
    }

    set_texture_coords(size: Vec2, offset: Vec2) {
        // Optimization needed
        if (this.x_direction == 1) {
            this.texture_coords = new Float32Array([
                offset.x * size.x,
                offset.y * size.y + size.y,
                offset.x * size.x,
                offset.y * size.y,
                offset.x * size.x + size.x,
                offset.y * size.y + size.y,
                offset.x * size.x + size.x,
                offset.y * size.y,
            ]);
        } else {
            this.texture_coords = new Float32Array([
                offset.x * size.x + size.x,
                offset.y * size.y + size.y,
                offset.x * size.x + size.x,
                offset.y * size.y,
                offset.x * size.x,
                offset.y * size.y + size.y,
                offset.x * size.x,
                offset.y * size.y,
            ]);
        }

        renderer.gl.bindBuffer(
            renderer.gl.ARRAY_BUFFER,
            this.texture_buffer.buffer
        );
        renderer.gl.bufferSubData(
            renderer.gl.ARRAY_BUFFER,
            0,
            this.texture_coords
        );
    }
}
