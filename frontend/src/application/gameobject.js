import { Obj, quad } from "../renderer/object.js";
import { gravity } from "./app.js";

export class GameObject {
    constructor(renderer, size, position, color) {
        let q = quad(size[0], size[1], color);
        this.object = new Obj(q.positions, q.indicies, q.color, renderer, size[0] ,size[1]);
        this.object.transform.pos.x = position[0];
        this.object.transform.pos.y = position[1];
        this.mass = size[0] * size[1];
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

        this.velocity = {
            x: 0.,
            y: 0.,
        };

        this.acceleration = {
            x: 0.,
            y: 0.,
        };
    }

    start() {
        
    }

    collide() {
        let collisions = [];
        for (let obj of GameObject.objects) {
            if (obj.collidable && obj != this) {
                const x_collision = this.object.transform.pos.x + this.object.dimensions.x - obj.object.transform.pos.x + this.velocity.x;
                const y_collision = this.object.transform.pos.y + this.object.dimensions.y - obj.object.transform.pos.y + this.velocity.y;

                
                if (x_collision > 0 && x_collision < this.object.dimensions.x + obj.object.dimensions.x) {
                    if (y_collision > 0 && y_collision < this.object.dimensions.y + obj.object.dimensions.y) {
                        let x_min = Math.min(this.object.transform.pos.x, obj.object.transform.pos.x);
                        let x_max = Math.max(this.object.transform.pos.x + this.object.dimensions.x, obj.object.transform.pos.x + obj.object.dimensions.x);

                        let y_min = Math.min(this.object.transform.pos.y, obj.object.transform.pos.y);
                        let y_max = Math.max(this.object.transform.pos.y + this.object.dimensions.y, obj.object.transform.pos.y + obj.object.dimensions.y);

                        let x_diff = Math.abs(obj.object.dimensions.x - (x_max - x_min - this.object.dimensions.x));
                        let y_diff = Math.abs(obj.object.dimensions.y - (y_max - y_min - this.object.dimensions.y));


                        if (x_diff < y_diff) {
                            collisions.push({obj: obj, x_axis: true});
                        }
                        else {
                            collisions.push({obj: obj, x_axis: false});
                        }

                        if (collisions.length == 4) {
                            return collisions;
                        }
                    }
                }
            }
        }

        return collisions;
    }

    run(delta_time) {
        this.velocity.y += this.acceleration.y;
        this.velocity.x += this.acceleration.x;
        const collisions = this.collide();
        
        for (let collision of collisions) {
            if (collision.x_axis) {
                document.getElementById("PIIIII").innerText = Number(document.getElementById("PIIIII").innerText) + 1;
            }
            if (collision.obj.isDynamic) {
                let obj_vel_x = (2 * this.mass * this.velocity.x - this.mass * collision.obj.velocity.x + collision.obj.mass * collision.obj.velocity.x) / (this.mass + collision.obj.mass);
                let this_vel_x = collision.obj.velocity.x + obj_vel_x - this.velocity.x;
                let obj_vel_y = (2 * this.mass * this.velocity.y - this.mass * collision.obj.velocity.y + collision.obj.mass * collision.obj.velocity.y) / (this.mass + collision.obj.mass);
                let this_vel_y = collision.obj.velocity.y + obj_vel_y - this.velocity.y;
                
                
                if (collision.x_axis) {
                    collision.obj.velocity.x = obj_vel_x;
                    this.velocity.x = this_vel_x;
                }
                else {
                    collision.obj.velocity.y = obj_vel_y;
                    this.velocity.y = this_vel_y;
                }
            }
            else {
                if (collision.x_axis) {
                    this.velocity.x = -this.velocity.x + this.acceleration.x;
                }
                else {
                    this.velocity.y = -this.velocity.y + this.acceleration.y;
                }
            }
            
        }

        this.object.transform.pos.y += this.velocity.y;
        this.object.transform.pos.x += this.velocity.x;
    }
}