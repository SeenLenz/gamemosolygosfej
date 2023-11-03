import { Obj } from "../../renderer/object";
import { renderer } from "../../app";
import { Vec2 } from "../../lin_alg";

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

export class Hitbox {
    size: Vec2 = new Vec2(0, 0);
    pos: Vec2 = new Vec2(0, 0);
    pos_diff = Vec2.zeros();
    constructor(size: Vec2, pos: Vec2) {
        this.size.set_vec(size);
        this.pos.set_vec(pos);
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
    reactive: boolean;
    // --> hitbox
    hitbox: Hitbox;

    // textures
    texture_buffer: { buffer: WebGLBuffer; attribute: number };
    texture_coords: Float32Array;
    texture_index: number = 0;
    sprite_index: number = 0;
    //--> animations
    current_frame = 0;
    animation_timer = 0;
    constructor(size: Vec2, position: Vec2, auto_render = true, reactive = true) {
        this.object = renderer.base_quad_obj as Obj;
        this.mass = size.x * size.y;
        this.object_tag = ObjectTag.Empty;
        this.isDynamic = false;
        this.collidable = true;
        this.reactive = reactive;
        this.pos = position;
        this.size = size;
        this.hitbox = new Hitbox(this.size, this.pos);
        this.hitbox.pos_diff = this.pos.sub(this.hitbox.pos);
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

    run(delta_time: number) {}

    render() {
        this.object.render(renderer, this);
    }

    get index() {
        return GameObject.objects.findIndex((obj) => obj == this);
    }

    get hitbox_index() {
        return GameObject.hitboxes.findIndex((obj) => obj == this);
    }

    get texture() {
        return renderer.textures[this.texture_index];
    }

    remove() {
        GameObject.objects.splice(this.index, 1);
        GameObject.hitboxes.splice(this.hitbox_index, 1);
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
    constructor(scale: Vec2, position: Vec2, auto_render = true, collidable = true) {
        super(scale, position, auto_render, collidable);
    }

    run(delta_time: number) {
        super.run(delta_time);
    }
}

export class DynamicGameObj extends GameObject {
    reactive: boolean;
    velocity: Vec2;
    force: Vec2;
    collisions: boolean[];
    constructor(scale: Vec2, position: Vec2) {
        super(scale, position);

        this.isDynamic = true;
        this.reactive = false;

        this.velocity = new Vec2(0, 0);
        this.force = new Vec2(0, 0);
        this.collisions = new Array(4);
    }

    start() {}

    get acceleration() {
        return new Vec2(this.force.x / this.mass, this.force.y / this.mass);
    }

    add_force(force: Vec2) {
        this.force.add_self(force);
    }

    collide(delta_time: number) {
        let collisions = [];
        for (let obj of GameObject.hitboxes) {
            if (!(obj != this)) {
                continue;
            }

            let x_collision =
                this.hitbox.pos.x +
                this.hitbox.size.x -
                obj.hitbox.pos.x +
                this.velocity.x * delta_time;
            let y_collision =
                this.hitbox.pos.y +
                this.hitbox.size.y -
                obj.hitbox.pos.y +
                this.velocity.y * delta_time;

            if (obj.isDynamic) {
                x_collision -= (obj as DynamicGameObj).velocity.x * delta_time;
                y_collision -= (obj as DynamicGameObj).velocity.y * delta_time;
            }

            if (
                x_collision > 0 &&
                x_collision < this.hitbox.size.x + obj.hitbox.size.x
            ) {
                if (
                    y_collision > 0 &&
                    y_collision < this.hitbox.size.y + obj.hitbox.size.y
                ) {
                    let x_min = Math.min(this.hitbox.pos.x, obj.hitbox.pos.x);
                    let x_max = Math.max(
                        this.hitbox.pos.x + this.hitbox.size.x,
                        obj.hitbox.pos.x + obj.hitbox.size.x
                    );

                    let y_min = Math.min(this.hitbox.pos.y, obj.hitbox.pos.y);
                    let y_max = Math.max(
                        this.hitbox.pos.y + this.hitbox.size.y,
                        obj.hitbox.pos.y + obj.hitbox.size.y
                    );

                    let x_diff = Math.abs(
                        obj.hitbox.size.x - (x_max - x_min - this.hitbox.size.x)
                    );
                    let y_diff = Math.abs(
                        obj.hitbox.size.y - (y_max - y_min - this.hitbox.size.y)
                    );

                    if (x_diff < y_diff) {
                        if (
                            Math.abs(obj.hitbox.pos.x - this.hitbox.pos.x) <
                            Math.abs(
                                obj.hitbox.pos.x +
                                    obj.hitbox.size.x -
                                    this.hitbox.pos.x
                            )
                        ) {
                            collisions.push({
                                obj: obj,
                                dir: CollisionDir.Right,
                            });
                        } else {
                            collisions.push({
                                obj: obj,
                                dir: CollisionDir.Left,
                            });
                        }
                    } else {
                        if (
                            Math.abs(obj.hitbox.pos.y - this.hitbox.pos.y) <
                            Math.abs(
                                obj.hitbox.pos.y +
                                    obj.hitbox.size.y -
                                    this.hitbox.pos.y
                            )
                        ) {
                            collisions.push({
                                obj: obj,
                                x: 0,
                                dir: CollisionDir.Bottom,
                            });
                        } else {
                            collisions.push({
                                obj: obj,
                                x: 0,
                                dir: CollisionDir.Top,
                            });
                        }
                    }

                    if (collisions.length == 4) {
                        return collisions;
                    }
                }
            }
        }

        return collisions;
    }

    collision(delta_time: number) {
        const collisions = this.collide(delta_time);
        for (let i = 0; i < 4; i++) {
            this.collisions[i] = false;
        }
        for (let collision of collisions) {
            this.on_collision(collision);
        }
    }

    collision_dir(dir: CollisionDir): boolean {
        return this.collisions[dir];
    }

    private set_hb_position() {
        this.hitbox.pos.set_vec(this.pos.add(this.hitbox.pos_diff));
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

    on_collision(collision: { obj: GameObject; dir: CollisionDir }) {
        if (collision.dir > 1) {
            this.on_collision_x(collision.obj, collision.dir);
        } else {
            this.on_collision_y(collision.obj, collision.dir);
        }
        this.set_hb_position();
    }

    on_collision_x(obj: GameObject, dir: CollisionDir) {
        if (!this.reactive || !obj.reactive) {
            return;
        }
        if (dir == CollisionDir.Left) {
            this.pos.x =
                obj.hitbox.pos.x + obj.hitbox.size.x - this.hitbox.pos_diff.x;

            this.collisions[CollisionDir.Left] = true;
        } else {
            this.pos.x =
                obj.hitbox.pos.x - this.hitbox.size.x - this.hitbox.pos_diff.x;
            this.collisions[CollisionDir.Right] = true;
        }

        this.velocity.x = 0;
    }

    on_collision_y(obj: GameObject, dir: CollisionDir) {
        if (!this.reactive || !obj.reactive) {
            return;
        }
        if (dir == CollisionDir.Top) {
            this.pos.y =
                obj.hitbox.pos.y + obj.hitbox.size.y - this.hitbox.pos_diff.y;
            this.collisions[CollisionDir.Top] = true;
        } else {
            this.pos.y =
                obj.hitbox.pos.y - this.hitbox.size.y - this.hitbox.pos_diff.y;
            this.collisions[CollisionDir.Bottom] = true;
        }

        this.velocity.y = 0;
    }
}
