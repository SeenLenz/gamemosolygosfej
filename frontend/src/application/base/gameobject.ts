import { Obj, Quad} from "../../renderer/object";
import { gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";

export enum ObjectTag {
    None,
    Player,
    Terrain
}

export enum CollisionDir {
    Top,
    Bottom,
    Right,
    Left,
}

export class GameObject {
    object: Obj;
    mass: number;
    object_tag: ObjectTag;
    pos: Vec2;
    scale: Vec2;
    collidable: boolean;
    isDynamic: boolean;
    constructor(scale: Vec2, position: Vec2) {
        this.object = renderer.base_quad_obj as Obj;
        this.mass = scale.x * scale.y;
        this.object_tag = ObjectTag.None;
        this.isDynamic = false;
        this.collidable = true;
        this.pos = position;
        this.scale = scale;
        
        GameObject.objects.push(this);
    }

    run(delta_time: number) {
    }

    render() {
        this.object.render(renderer, this.pos, this.scale);
    }

    static objects: GameObject[] = [];
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

            let x_collision = this.pos.x + this.scale.x - obj.pos.x + this.velocity.x * delta_time;
            let y_collision = this.pos.y + this.scale.y - obj.pos.y + this.velocity.y * delta_time;

            if (obj.isDynamic) {
                x_collision -= (obj as DynamicGameObj).velocity.x * delta_time;
                y_collision -= (obj as DynamicGameObj).velocity.y * delta_time;
            }

            if (x_collision > 0 && x_collision < this.scale.x + obj.scale.x) {
                if (y_collision > 0 && y_collision < this.scale.y + obj.scale.y) {
                    let x_min = Math.min(this.pos.x, obj.pos.x);
                    let x_max = Math.max(this.pos.x + this.scale.x, obj.pos.x + obj.scale.x);

                    let y_min = Math.min(this.pos.y, obj.pos.y);
                    let y_max = Math.max(this.pos.y + this.scale.y, obj.pos.y + obj.scale.y);

                    let x_diff = Math.abs(obj.scale.x - (x_max - x_min - this.scale.x));
                    let y_diff = Math.abs(obj.scale.y - (y_max - y_min - this.scale.y));

                    if (x_diff < y_diff) {
                        if (Math.abs(obj.pos.x - this.pos.x) < Math.abs(obj.pos.x + obj.scale.x - this.pos.x)) {
                            collisions.push({ obj: obj, dir: CollisionDir.Right });
                        }
                        else {
                            collisions.push({ obj: obj, dir: CollisionDir.Left });
                        }
                    }
                    else {
                        if (Math.abs(obj.pos.y - this.pos.y) < Math.abs(obj.pos.y + obj.scale.y - this.pos.y)) {
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
        this.velocity.y += this.acceleration.y * delta_time;
        this.velocity.x += this.acceleration.x * delta_time;
        
        this.velocity.y = Math.abs(this.velocity.y) < delta_time * gravity ? 0 : this.velocity.y;
        
        this.pos.y += this.velocity.y * delta_time;
        this.pos.x += this.velocity.x * delta_time;
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
            this.pos.x = obj.pos.x + obj.scale.x;
            this.collisions[CollisionDir.Left] = true;
        }
        else {
            this.pos.x = obj.pos.x - this.scale.x;
            this.collisions[CollisionDir.Right] = true;
        }
    }

    on_collision_y(obj: GameObject, dir: CollisionDir) {
        if (dir == CollisionDir.Top) {
            this.pos.y = obj.pos.y + obj.scale.y;
            this.collisions[CollisionDir.Top] = true;
        }
        else {
            this.pos.y = obj.pos.y - this.scale.y;
            this.collisions[CollisionDir.Bottom] = true;
        }

        this.velocity.y = 0;
    }
}