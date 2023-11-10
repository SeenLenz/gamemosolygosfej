import { Obj } from "../../renderer/object";
import { delta_time, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { create_line, create_section, ray_side_collision, ray_side_intersection } from "./rays";

export enum ObjectTag {
    Empty,
    Player,
    Terrain,
    StreetLamp,
    Bench,
    House,
}

export enum CollisionDir {
    Top,
    Bottom,
    Right,
    Left,
}

export enum HitboxFlags {
    Platform,
}

export class Hitbox {
    size: Vec2 = new Vec2(0, 0);
    pos: Vec2 = new Vec2(0, 0);
    pos_diff = Vec2.zeros();
    reactive = false;
    flags: HitboxFlags[] = [];
    collisions: boolean[] = [false, false, false, false];
    constructor(size: Vec2, pos: Vec2, reactive = true) {
        this.size.set_vec(size);
        this.pos.set_vec(pos);
        this.reactive = reactive;
    }

    collision_dir(dir: CollisionDir): boolean {
        return this.collisions[dir];
    }
}

export class GameObject {
    // render attribs
    object: Obj;
    rotation: number;
    pos: Vec2;
    size: Vec2;
    z_coord: number = 1;
    x_direction: number = 1;

    // object props
    mass: number;
    collidable: boolean;
    isDynamic: boolean;
    object_tag: ObjectTag;
    // --> hitbox
    hitboxes: Hitbox[] = [];

    // textures
    texture_buffer: { buffer: WebGLBuffer; attribute: number };
    texture_coords: Float32Array;
    texture_index: number = 0;
    sprite_index: number = 0;
    //--> animations
    current_frame = 0;
    animation_timer = 0;
    constructor(
        size: Vec2,
        position: Vec2,
        auto_render = true,
        reactive = true
    ) {
        this.object = renderer.base_quad_obj as Obj;
        this.mass = size.x * size.y;
        this.object_tag = ObjectTag.Empty;
        this.isDynamic = false;
        this.collidable = true;
        this.pos = position;
        this.size = size;
        this.hitboxes.push(new Hitbox(this.size, this.pos, reactive));
        this.hitboxes[0].pos_diff = this.pos.sub(this.hitboxes[0].pos);
        this.rotation = 0;
        this.texture_coords = new Float32Array(8);
        this.texture_buffer = renderer.create_buffer(
            renderer.gl.STATIC_DRAW,
            this.texture_coords,
            "texture_coord"
        );
        if (auto_render) {
            GameObject.objects.push(this);
        }
        if (this.collidable) {
            GameObject.hitboxes.push(this);
        }
    }

    run(delta_time: number) {
        for (let hb of this.hitboxes) {
            for (let i = 0; i < 4; i++) {
                hb.collisions[i] = false;
            }
        }
    }

    render() {
        this.object.render(renderer, this);
    }

    get index() {
        return GameObject.objects.findIndex((obj) => obj == this);
    }

    get hitbox_index() {
        const index = GameObject.hitboxes.findIndex((obj) => obj == this);
        return index;
    }

    get texture() {
        return renderer.textures[this.texture_index];
    }

    remove() {
        GameObject.objects.splice(this.index, 1);
        GameObject.hitboxes.splice(this.hitbox_index, 1);
    }

    remove_hitbox(hitbox_index: number) {
        this.hitboxes.splice(hitbox_index, 1);
    }

    get sprite() {
        return this.texture.sprites[this.sprite_index];
    }

    get sprite_size() {
        return new Vec2(1, 1).div(this.texture.max_sprites);
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

    animate(frame_diff: number) {
        if (performance.now() - this.animation_timer > frame_diff) {
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
    }

    static objects: GameObject[] = [];
    static hitboxes: GameObject[] = [];
}

export class Empty extends GameObject {
    constructor(position: Vec2) {
        super(new Vec2(0, 0), position);
        this.collidable = false;
        this.mass = 0;
        this.object_tag = ObjectTag.Empty;
    }
}

export class StaticGameObj extends GameObject {
    collision_obj: GameObject | null = null;
    constructor(
        scale: Vec2,
        position: Vec2,
        auto_render = true,
        collidable = true
    ) {
        super(scale, position, auto_render, collidable);
    }

    run(delta_time: number) {
        super.run(delta_time);
        this.collision_obj = null;
    }
}

export class DynamicGameObj extends GameObject {
    velocity: Vec2;
    force: Vec2;
    constructor(scale: Vec2, position: Vec2) {
        super(scale, position);

        this.isDynamic = true;

        this.velocity = new Vec2(0, 0);
        this.force = new Vec2(0, 0);
    }

    start() {}

    get acceleration() {
        return new Vec2(this.force.x / this.mass, this.force.y / this.mass);
    }

    add_force(force: Vec2) {
        this.force.add_self(force);
    }

    collide(delta_time: number) {
        let collisions: any[] = [];
        for (let obj of GameObject.hitboxes) {
            for (let this_hitbox of this.hitboxes) {
                for (let obj_hitbox of obj.hitboxes) {
                    if (!(obj != this)) {
                        continue;
                    }

                    let rayXSide;
                    let rayYSide;
                    if (this.velocity.x * this.velocity.y < 0) {
                        ray1 = create_line(
                            this.velocity,
                            this_hitbox.pos.add(
                                Vec2.from({ x: this_hitbox.size.x, y: 0 })
                            )
                        );
                        ray2 = create_line(
                            this.velocity,
                            this_hitbox.pos.add(
                                Vec2.from({ x: 0, y: this_hitbox.size.y })
                            )
                        );
                    } else {
                        ray1 = create_line(this.velocity, this_hitbox.pos);
                        ray2 = create_line(
                            this.velocity,
                            this_hitbox.pos.add(this_hitbox.size)
                        );
                    }

                    if (this.velocity.x < 0) {
                    }
                    if (this.velocity.y < 0) {
                    }
                }
            }
        }
        return collisions;
    }

    collision(delta_time: number) {
        const collisions = this.collide(delta_time);

        for (let collision of collisions) {
            this.on_collision(collision);
            let obj_col_dir = collision.dir + (collision.dir % 2) * -2 + 1;
            if (!collision.obj.isDynamic) {
                collision.obj_hitbox.collisions[obj_col_dir] = true;
                (collision.obj as StaticGameObj).collision_obj = this;
            }
        }
    }

    private set_hb_position() {
        for (let hitbox of this.hitboxes) {
            hitbox.pos.set_vec(this.pos.add(hitbox.pos_diff));
        }
    }

    motion(delta_time: number) {
        this.velocity.y += this.force.y * delta_time;
        this.velocity.x -= this.force.x * delta_time;

        this.pos.y += this.velocity.y * delta_time;
        this.pos.x += this.velocity.x * delta_time;

        this.set_hb_position();
        this.force.set(0, 0);
    }

    run(delta_time: number) {
        super.run(delta_time);
    }

    on_collision(collision: {
        obj: GameObject;
        dir: CollisionDir;
        obj_hitbox: Hitbox;
        this_hitbox: Hitbox;
    }) {
        if (collision.dir > 1) {
            this.on_collision_x(
                collision.obj,
                collision.dir,
                collision.obj_hitbox,
                collision.this_hitbox
            );
        } else {
            this.on_collision_y(
                collision.obj,
                collision.dir,
                collision.obj_hitbox,
                collision.this_hitbox
            );
        }

        this.set_hb_position();
    }

    on_collision_x(
        obj: GameObject,
        dir: CollisionDir,
        obj_hitbox: Hitbox,
        this_hitbox: Hitbox
    ) {
        if (!this_hitbox.reactive || !obj_hitbox.reactive) {
            return;
        }

        if (dir == CollisionDir.Left) {
            this.pos.x =
                obj_hitbox.pos.x + obj_hitbox.size.x - this_hitbox.pos_diff.x;

            this_hitbox.collisions[CollisionDir.Left] = true;
        } else {
            this.pos.x =
                obj_hitbox.pos.x - this_hitbox.size.x - this_hitbox.pos_diff.x;
            this_hitbox.collisions[CollisionDir.Right] = true;
        }

        this.velocity.x = 0;
    }

    on_collision_y(
        obj: GameObject,
        dir: CollisionDir,
        obj_hitbox: Hitbox,
        this_hitbox: Hitbox
    ) {
        if (!this_hitbox.reactive || !obj_hitbox.reactive) {
            return;
        }

        if (dir == CollisionDir.Top) {
            this.pos.y =
                obj_hitbox.pos.y + obj_hitbox.size.y - this_hitbox.pos_diff.y;
            this_hitbox.collisions[CollisionDir.Top] = true;
        } else {
            this.pos.y =
                obj_hitbox.pos.y - this_hitbox.size.y - this_hitbox.pos_diff.y;
            this_hitbox.collisions[CollisionDir.Bottom] = true;
        }

        this.velocity.y = 0;
    }
}
