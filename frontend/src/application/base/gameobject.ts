import { Obj } from "../../renderer/object";
import { camera, delta_time, gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import {
    Line,
    Point,
    DebugPoint as DebugPoint,
    create_line,
    create_section,
    float_eq,
    ray_side_intersection,
} from "./rays";
import { SpriteSheets } from "./textures";

export enum ObjectTag {
    Empty,
    Player,
    Terrain,
    StreetLamp,
    Bench,
    House,
}

export type CollisionObj = {
    this_hitbox: Hitbox;
    obj: GameObject;
    obj_hitbox: Hitbox;
    ray_source: Point;
    point: Point;
    dir: CollisionDir;
};

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
    }

    get_opposite_collision_dir(direction: CollisionDir) {
        return direction + (direction % 2) * 2 - 1;
    }

    loop(delta_time: number) {}

    render() {
        this.object.render(renderer, this);
    }

    get index() {
        return GameObject.objects.findIndex((obj) => obj == this);
    }

    // get hitbox_index() {
    //     const index = GameObject.hitboxes.findIndex((obj) => obj == this);
    //     return index;
    // }

    get texture() {
        return renderer.textures[this.texture_index];
    }

    // remove() {
    //     GameObject.objects.splice(this.index, 1);
    //     GameObject.hitboxes.splice(this.hitbox_index, 1);
    // }

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
    static static_hitboxes: GameObject[] = [];
    static dynamic_hitboxes: GameObject[] = [];
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
        GameObject.static_hitboxes.push(this);
    }

    loop(delta_time: number) {
        super.loop(delta_time);
        this.collision_obj = null;
        for (let hb of this.hitboxes) {
            for (let i = 0; i < 4; i++) {
                hb.collisions[i] = false;
            }
        }
    }
}

export class DynamicGameObj extends GameObject {
    velocity: Vec2;
    force: Vec2;
    prev_frame_velocity_normalized: Vec2 = Vec2.zeros();
    velocity_changed = false;
    closest_intersection_obj?: {
        x: CollisionObj | undefined;
        y: CollisionObj | undefined;
    };
    components: [boolean, boolean] = [false, false];
    points: DebugPoint[] = [new DebugPoint(), new DebugPoint()];
    constructor(scale: Vec2, position: Vec2) {
        super(scale, position);

        this.isDynamic = true;

        this.velocity = new Vec2(0, 0);
        this.force = new Vec2(0, 0);
    }

    start() {}
    loop(delta_time: number) {
        for (let hb of this.hitboxes) {
            for (let i = 0; i < 4; i++) {
                hb.collisions[i] = false;
            }
        }
        super.loop(delta_time);
        this.motion();
        this.collision();
        this.set_positions();
        this.run(delta_time);
    }

    run(delta_time: number) {}

    get acceleration() {
        return new Vec2(this.force.x / this.mass, this.force.y / this.mass);
    }

    add_force(force: Vec2) {
        this.force.add_self(force);
    }

    private set_hb_position() {
        for (let hitbox of this.hitboxes) {
            hitbox.pos.set_vec(this.pos.add(hitbox.pos_diff));
        }
    }

    motion() {
        this.velocity_changed = false;
        this.velocity.y += this.force.y * delta_time;
        this.velocity.x -= this.force.x * delta_time;

        const normalized_velocity = this.velocity.normalize();

        if (
            !(
                float_eq(
                    this.prev_frame_velocity_normalized.x,
                    normalized_velocity.x
                ) &&
                float_eq(
                    this.prev_frame_velocity_normalized.y,
                    normalized_velocity.y
                )
            )
        ) {
            this.prev_frame_velocity_normalized =
                Vec2.from(normalized_velocity);
            this.velocity_changed = true;
        }
    }

    set_positions() {
        this.pos.y += this.velocity.y * delta_time;
        this.pos.x += this.velocity.x * delta_time;

        this.set_hb_position();
        this.force.set(0, 0);
    }

    collision() {
        if (this.velocity_changed && this.velocity.magnitude != 0) {
            console.log("asd");
            this.closest_intersection_obj = this.get_closest_interection();
        }
        const x_obj = this.closest_intersection_obj?.x;
        const y_obj = this.closest_intersection_obj?.y;
        if (x_obj) {
            if (
                Math.abs(
                    Math.abs(x_obj.dir - 3) * x_obj.this_hitbox.size.x +
                        x_obj.this_hitbox.pos.x -
                        x_obj.point.x
                ) <= Math.abs(this.velocity.x * delta_time)
            ) {
                this.on_collision_x(x_obj);
            }
        }
        if (y_obj) {
            if (
                Math.abs(
                    y_obj.dir * y_obj.this_hitbox.size.y +
                        y_obj.this_hitbox.pos.y -
                        y_obj.point.y
                ) <= Math.abs(this.velocity.y * delta_time)
            ) {
                this.on_collision_y(y_obj);
            }
        }

        this.set_hb_position();
    }

    on_collision_x(obj: CollisionObj) {
        if (!obj.this_hitbox.reactive || !obj.obj_hitbox.reactive) {
            return;
        }

        if (obj.dir == CollisionDir.Left) {
            this.pos.x =
                obj.obj_hitbox.pos.x +
                obj.obj_hitbox.size.x -
                obj.this_hitbox.pos_diff.x;
            obj.this_hitbox.collisions[CollisionDir.Left] = true;
        } else {
            this.pos.x =
                obj.obj_hitbox.pos.x -
                obj.this_hitbox.size.x -
                obj.this_hitbox.pos_diff.x;
            obj.this_hitbox.collisions[CollisionDir.Right] = true;
        }

        this.velocity.x = 0;
    }

    on_collision_y(obj: CollisionObj) {
        if (!obj.this_hitbox.reactive || !obj.obj_hitbox.reactive) {
            return;
        }

        if (obj.dir == CollisionDir.Top) {
            this.pos.y =
                obj.obj_hitbox.pos.y +
                obj.obj_hitbox.size.y -
                obj.this_hitbox.pos_diff.y;
            obj.this_hitbox.collisions[CollisionDir.Top] = true;
        } else {
            this.pos.y =
                obj.obj_hitbox.pos.y -
                obj.this_hitbox.size.y -
                obj.this_hitbox.pos_diff.y;
            obj.this_hitbox.collisions[CollisionDir.Bottom] = true;
        }

        this.velocity.y = 0;
    }

    get_closest_interection() {
        let closest_itersection_point: {
            x: CollisionObj | undefined;
            y: CollisionObj | undefined;
        } = { x: undefined, y: undefined };
        for (let obj of GameObject.static_hitboxes) {
            for (let this_hitbox of this.hitboxes) {
                for (let obj_hitbox of obj.hitboxes) {
                    let rayXSide = { x: 0, y: 1 };
                    let rayYSide = { x: 1, y: 0 };
                    let y_dir = -1;
                    let x_dir = -1;
                    if (this.velocity.x >= 0) {
                        rayXSide.x = 1;
                        rayYSide.x = 0;
                        x_dir = 1;
                    }
                    if (this.velocity.y >= 0) {
                        rayXSide.y = 0;
                        rayYSide.y = 1;
                        y_dir = 1;
                    }

                    let rayX_start_point = this_hitbox.pos.add(
                        this_hitbox.size.mul(Vec2.from(rayXSide))
                    );

                    let rayY_start_point = this_hitbox.pos.add(
                        this_hitbox.size.mul(Vec2.from(rayYSide))
                    );

                    let obj_side_x = create_section(
                        obj_hitbox.pos.add(
                            obj_hitbox.size.mul({
                                x: Math.abs(rayXSide.x - 1),
                                y: 0,
                            })
                        ),
                        obj_hitbox.pos.add(
                            obj_hitbox.size.mul({
                                x: Math.abs(rayXSide.x - 1),
                                y: 1,
                            })
                        )
                    );

                    let obj_side_y = create_section(
                        obj_hitbox.pos.add(
                            obj_hitbox.size.mul({
                                x: 0,
                                y: Math.abs(rayYSide.y - 1),
                            })
                        ),
                        obj_hitbox.pos.add(
                            obj_hitbox.size.mul({
                                x: 1,
                                y: Math.abs(rayYSide.y - 1),
                            })
                        )
                    );

                    let rayX = create_line(this.velocity, rayX_start_point);
                    let rayY = create_line(this.velocity, rayY_start_point);

                    //is = INTERSECTION SIDE (with ray) :))))))
                    let x_collision = false;
                    let y_collision = false;

                    const is_x = {
                        x: ray_side_intersection(rayX, obj_side_x),
                        y: ray_side_intersection(rayY, obj_side_x),
                    };
                    const is_y = {
                        x: ray_side_intersection(rayX, obj_side_y),
                        y: ray_side_intersection(rayY, obj_side_y),
                    };

                    if (obj_side_x.p1.x * x_dir > rayY_start_point.x * x_dir) {
                        x_collision = true;
                    }

                    if (obj_side_y.p1.y * y_dir > rayX_start_point.y * y_dir) {
                        y_collision = true;
                    }

                    if (x_collision && is_x.x && is_x.y) {
                        this.points[0].set_pos(is_x.x.point);
                        this.points[1].set_pos(is_x.y.point);
                        if (
                            (!is_x.x.side_intersection &&
                                !is_x.y.side_intersection &&
                                (is_x.y.point.y - obj_side_x.p1.y) *
                                    (is_x.x.point.y - obj_side_y.p1.y) <
                                    0) ||
                            is_x.x.side_intersection ||
                            is_x.y.side_intersection
                        ) {
                            if (!closest_itersection_point.x) {
                                closest_itersection_point.x = {
                                    this_hitbox: this_hitbox,
                                    obj_hitbox: obj_hitbox,
                                    obj: obj,
                                    point: is_x.x.point,
                                    dir: 3 - (x_dir + 1) / 2,
                                    ray_source: rayX_start_point,
                                };
                            } else if (
                                Math.abs(
                                    rayY_start_point.x -
                                        closest_itersection_point.x.point.x
                                ) >
                                Math.abs(rayY_start_point.x - is_x.x.point.x)
                            ) {
                                closest_itersection_point.x.obj_hitbox =
                                    obj_hitbox;
                                closest_itersection_point.x.this_hitbox =
                                    this_hitbox;
                                closest_itersection_point.x.point =
                                    is_x.x.point;
                                closest_itersection_point.x.obj = obj;
                                closest_itersection_point.x.dir =
                                    3 - (x_dir + 1) / 2;
                                closest_itersection_point.x.ray_source =
                                    rayX_start_point;
                            }
                        }
                    }

                    if (y_collision && is_y.x && is_y.y) {
                        if (
                            (!is_y.x.side_intersection &&
                                !is_y.y.side_intersection &&
                                (is_y.x.point.x - obj_side_y.p1.x) *
                                    (is_y.y.point.x - obj_side_x.p1.x) <
                                    0) ||
                            is_y.x.side_intersection ||
                            is_y.y.side_intersection
                        ) {
                            if (!closest_itersection_point.y) {
                                closest_itersection_point.y = {
                                    this_hitbox: this_hitbox,
                                    obj_hitbox: obj_hitbox,
                                    obj: obj,
                                    point: is_y.y.point,
                                    dir: (y_dir + 1) / 2,
                                    ray_source: rayY_start_point,
                                };
                            } else if (
                                Math.abs(
                                    rayY_start_point.y -
                                        closest_itersection_point.y.point.y
                                ) >
                                Math.abs(rayY_start_point.y - is_y.y.point.y)
                            ) {
                                closest_itersection_point.y.obj_hitbox =
                                    obj_hitbox;
                                closest_itersection_point.y.this_hitbox =
                                    this_hitbox;
                                closest_itersection_point.y.point =
                                    is_y.y.point;
                                closest_itersection_point.y.obj = obj;
                                closest_itersection_point.y.dir =
                                    (y_dir + 1) / 2;
                                closest_itersection_point.y.ray_source =
                                    rayY_start_point;
                            }
                        }
                    }
                }
            }
        }

        return closest_itersection_point;
    }
}
