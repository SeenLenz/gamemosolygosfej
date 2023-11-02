import { SpriteSheets, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";

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
    speed: number;
    repeat: number;
    current_cycle = 0;
    rotation = 0;

    constructor(
        size: Vec2,
        pos: Vec2,
        x_dir: number,
        texure_index: SpriteSheets,
        effect: number,
        speed: number,
        repeat: number
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
        this.speed = speed;
        this.repeat = repeat;
        this.size = size;
        this.pos = pos;

        Effect.effects.push(this);
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
        Effect.effects.splice(this.index, 1);
    }

    static effects: Effect[] = [];

    animate() {
        if (performance.now() - this.animation_timer > this.speed) {
            this.animation_timer = performance.now();
            this.current_frame += 1;
            if (this.current_frame > this.sprite[1] - 1) {
                this.current_frame = 0;
            }
            this.set_texture_coords(
                new Vec2(this.sprite_size.x, this.sprite_size.y),
                new Vec2(
                    this.sprite[0].x + this.current_frame,
                    this.sprite[0].y
                )
            );
        }
        this.object?.render(renderer, this);
        if (this.current_frame == 0 && this.current_cycle >= this.repeat) {
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
