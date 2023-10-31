import { Obj, Quad} from "../../renderer/object";
import { gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";

export enum ObjectTag {
    Empty,
    Player,
    Terrain
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
    constructor(size: Vec2, pos: Vec2) {
        this.size.set_vec(size);
        this.pos.set_vec(pos);
    }
}

export class GameObject {
    object: Obj;
    mass: number;
    object_tag: ObjectTag;
    pos: Vec2;
    hitbox: Hitbox;
    hb_pos_diff: Vec2;
    size: Vec2;
    collidable: boolean;
    isDynamic: boolean;
    rotation: number;
    constructor(size: Vec2, position: Vec2) {
        this.object = renderer.base_quad_obj as Obj;
        this.mass = size.x * size.y;
        this.object_tag = ObjectTag.Empty;
        this.isDynamic = false;
        this.collidable = true;
        this.pos = position;
        this.size = size;
        this.hitbox = new Hitbox(this.size, this.pos);
        this.hb_pos_diff = this.pos.sub(this.hitbox.pos);
        this.rotation = 0;
        GameObject.objects.push(this);
    }

    run(delta_time: number) {
        // this.rotation = (this.rotation + 0.01) % (3.141 * 2);
    }

    render() {
        this.object.render(renderer, this.pos, this.size, this.rotation);
    }

    static objects: GameObject[] = [];
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
    constructor(scale: Vec2, position: Vec2) {
        super(scale, position);
    }

    run(delta_time: number) {

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

    start() {

    }

    get acceleration() {
        return new Vec2(this.force.x / this.mass, this.force.y / this.mass);
    }

    add_force(force: Vec2) {
        this.force.add_self(force);
    }

    collide(delta_time: number) {
        let collisions = [];
        for (let obj of GameObject.objects) {
            if ((this.isDynamic && !this.reactive && obj.isDynamic) || (obj.isDynamic && !(obj as DynamicGameObj).reactive && this.isDynamic)) {
                continue;
            }

            if (!(this.collidable && obj.collidable && obj != this)) {
                continue;
            }

            let x_collision = this.hitbox.pos.x + this.hitbox.size.x - obj.hitbox.pos.x + this.velocity.x * delta_time;
            let y_collision = this.hitbox.pos.y + this.hitbox.size.y - obj.hitbox.pos.y + this.velocity.y * delta_time;

            if (obj.isDynamic) {
                x_collision -= (obj as DynamicGameObj).velocity.x * delta_time;
                y_collision -= (obj as DynamicGameObj).velocity.y * delta_time;
            }

            if (x_collision > 0 && x_collision < this.hitbox.size.x + obj.hitbox.size.x) {
                if (y_collision > 0 && y_collision < this.hitbox.size.y + obj.hitbox.size.y) {
                    let x_min = Math.min(this.hitbox.pos.x, obj.hitbox.pos.x);
                    let x_max = Math.max(this.hitbox.pos.x + this.hitbox.size.x, obj.hitbox.pos.x + obj.hitbox.size.x);

                    let y_min = Math.min(this.hitbox.pos.y, obj.hitbox.pos.y);
                    let y_max = Math.max(this.hitbox.pos.y + this.hitbox.size.y, obj.hitbox.pos.y + obj.hitbox.size.y);

                    let x_diff = Math.abs(obj.hitbox.size.x - (x_max - x_min - this.hitbox.size.x));
                    let y_diff = Math.abs(obj.hitbox.size.y - (y_max - y_min - this.hitbox.size.y));

                    if (x_diff < y_diff) {
                        if (Math.abs(obj.hitbox.pos.x - this.hitbox.pos.x) < Math.abs(obj.hitbox.pos.x + obj.hitbox.size.x - this.hitbox.pos.x)) {
                            collisions.push({ obj: obj, dir: CollisionDir.Right });
                        }
                        else {
                            collisions.push({ obj: obj, dir: CollisionDir.Left });
                        }
                    }
                    else {
                        if (Math.abs(obj.hitbox.pos.y - this.hitbox.pos.y) < Math.abs(obj.hitbox.pos.y + obj.hitbox.size.y - this.hitbox.pos.y)) {
                            collisions.push({ obj: obj, x: 0, dir: CollisionDir.Bottom });
                        }
                        else {
                            collisions.push({ obj: obj, x: 0, dir: CollisionDir.Top });
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

    motion(delta_time: number) {
        this.velocity.y += this.force.y * delta_time;
        this.velocity.x -= this.force.x * delta_time;
        
        this.pos.y += this.velocity.y * delta_time;
        this.pos.x += this.velocity.x * delta_time;

        this.hitbox.pos.set_vec(this.pos.add(this.hb_pos_diff));
        this.force.set(0, 0);
    }

    run(delta_time: number) {
        super.run(delta_time);
    }

    on_collision(collision: {obj: GameObject, dir: CollisionDir}) {
        if (collision.dir > 1) {
            this.on_collision_x(collision.obj, collision.dir);
        }
        else {
            this.on_collision_y(collision.obj, collision.dir);
        }
    }

    on_collision_x(obj: GameObject, dir: CollisionDir) {
        if (dir == CollisionDir.Left) {
            this.pos.x = obj.hitbox.pos.x + obj.hitbox.size.x - this.hb_pos_diff.x;

            this.collisions[CollisionDir.Left] = true;
        }
        else {
            this.pos.x = obj.hitbox.pos.x - this.hitbox.size.x - this.hb_pos_diff.x;
            this.collisions[CollisionDir.Right] = true;
        }

        this.velocity.x = -this.velocity.x * 0.4;
    }

    on_collision_y(obj: GameObject, dir: CollisionDir) {
        if (dir == CollisionDir.Top) {
            this.pos.y = obj.hitbox.pos.y + obj.hitbox.size.y - this.hb_pos_diff.y;
            this.collisions[CollisionDir.Top] = true;
        }
        else {
            this.pos.y = obj.hitbox.pos.y - this.hitbox.size.y - this.hb_pos_diff.y;
            this.collisions[CollisionDir.Bottom] = true;
        }

        this.velocity.y = -this.velocity.y * 0.4;
    }
}