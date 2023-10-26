import { Obj, quad } from "../renderer/object.js";
import { gravity } from "./app.js";

export class GameObject {
    constructor(renderer, size, position, color) {
        let q = quad(size[0], size[1], color);
        this.object = new Obj(q.positions, q.indicies, q.color, renderer, size[0] ,size[1]);
        this.object.transform.pos.x = position[0];
        this.object.transform.pos.y = position[1];
        this.mass = size[0] * size[1];
        this.object_tag;
        this.isDynamic = false;
        GameObject.objects.push(this);

        this.collidable = true;
    }

    static objects = [];
}

export class StaticGameObj extends GameObject {
    constructor(renderer, size, position, color, mass) {
        super(renderer, size, position, color, mass)
    }

    run() {

    }
}

export class DynamicGameObj extends GameObject {
    constructor(renderer, size, position, color) {
        super(renderer, size, position, color);

        this.isDynamic = true;
        this.reactive = false;

        this.velocity = {
            x: 0.,
            y: 0.,
        };

        this.force = {
            x: 0.,
            y: 0.,
        };
    }

    start() {
        
    }

    collide() {
        let collisions = [];
        for (let obj of GameObject.objects) {
            if ((this.isDynamic && !this.reactive && obj.isDynamic) || (obj.isDynamic && !obj.reactive && this.isDynamic)) {
                continue;
            }

            if (!(this.collidable && obj.collidable && obj != this)) {
                continue;
            }

            let x_collision = this.object.transform.pos.x + this.object.dimensions.x - obj.object.transform.pos.x + this.velocity.x;
            let y_collision = this.object.transform.pos.y + this.object.dimensions.y - obj.object.transform.pos.y + this.velocity.y;

            if (obj.isDynamic) {
                x_collision -= obj.velocity.x;
                y_collision -= obj.velocity.y;
            }

            if (x_collision > 0 && x_collision < this.object.dimensions.x + obj.object.dimensions.x) {
                if (y_collision > 0 && y_collision < this.object.dimensions.y + obj.object.dimensions.y) {
                    let x_min = Math.min(this.object.transform.pos.x, obj.object.transform.pos.x);
                    let x_max = Math.max(this.object.transform.pos.x + this.object.dimensions.x, obj.object.transform.pos.x + obj.object.dimensions.x);

                    let y_min = Math.min(this.object.transform.pos.y, obj.object.transform.pos.y);
                    let y_max = Math.max(this.object.transform.pos.y + this.object.dimensions.y, obj.object.transform.pos.y + obj.object.dimensions.y);

                    let x_diff = Math.abs(obj.object.dimensions.x - (x_max - x_min - this.object.dimensions.x));
                    let y_diff = Math.abs(obj.object.dimensions.y - (y_max - y_min - this.object.dimensions.y));

                    if (x_diff < y_diff) {
                        if (Math.abs(obj.object.transform.pos.x - this.object.transform.pos.x) < Math.abs(obj.object.transform.pos.x + obj.object.dimensions.x - this.object.transform.pos.x)) {
                            collisions.push({obj: obj, x: 1, y: 0});
                        }
                        else {
                            collisions.push({obj: obj, x: -1, y: 0});

                        }
                    }
                    else {
                        if (Math.abs(obj.object.transform.pos.y - this.object.transform.pos.y) < Math.abs(obj.object.transform.pos.y + obj.object.dimensions.y - this.object.transform.pos.y)) {
                            collisions.push({obj: obj, x: 0, y: 1});

                        }
                        else {
                            collisions.push({obj: obj, x: 0, y: -1});

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

    collision() {
        const collisions = this.collide();
        
        for (let collision of collisions) {
            this.on_collision(collision);
        }
    }

    motion(delta_time) {
        this.velocity.y += (this.force.y / this.mass) * delta_time;
        this.velocity.x += (this.force.x / this.mass) * delta_time;

        this.velocity.y = Math.abs(this.velocity.y) < gravity ? 0 : this.velocity.y;

        this.object.transform.pos.y += this.velocity.y;
        this.object.transform.pos.x += this.velocity.x;
    }

    run(delta_time) {

    }

    on_collision(collision) {
        if (collision.x != 0) {
            this.on_collision_x(collision.obj, collision.x);
        }
        else {
            this.on_collision_y(collision.obj, collision.y);
        }
    }

    on_collision_x(obj, dir) {
        if (dir == -1) {
            this.object.transform.pos.x = obj.object.transform.pos.x + obj.object.dimensions.x - this.velocity.x;
        }
        else {
            this.object.transform.pos.x = obj.object.transform.pos.x - this.object.dimensions.x - this.velocity.x;
        }

        if (obj.isDynamic) {
            let obj_vel_x = (2 * this.mass * this.velocity.x - this.mass * obj.velocity.x + obj.mass * obj.velocity.x) / (this.mass + obj.mass);
            let this_vel_x = obj.velocity.x + obj_vel_x - this.velocity.x;
            obj.velocity.x = obj_vel_x;
            this.velocity.x = this_vel_x;
        }
        else {
            this.velocity.x = -this.velocity.x + this.force.x / this.mass;
        }
    }

    on_collision_y(obj, dir) {
        if (dir == -1) {
            this.object.transform.pos.y = obj.object.transform.pos.y + obj.object.dimensions.y - this.velocity.y + 1;
        }
        else {
            this.object.transform.pos.y = obj.object.transform.pos.y - this.object.dimensions.y - this.velocity.y - 1;
        }
        
        this.velocity.y = (-this.velocity.y + this.force.y / this.mass) * 0.3;

        if (obj.isDynamic) {
            let obj_vel_y = (2 * this.mass * this.velocity.y - this.mass * obj.velocity.y + obj.mass * obj.velocity.y) / (this.mass + obj.mass);
            let this_vel_y = obj.velocity.y + obj_vel_y - this.velocity.y;
            obj.velocity.y = obj_vel_y * 0.9;
            this.velocity.y = this_vel_y * 0.9;
        }
    }
}