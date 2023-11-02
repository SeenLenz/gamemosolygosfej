import { event, gravity } from "../../app";
import { Vec2 } from "../../lin_alg";
import { EventType, Keys } from "../base/event_handler";
import {
    CollisionDir,
    DynamicGameObj,
    GameObject,
    Hitbox,
    ObjectTag,
} from "../base/gameobject";

export class Player extends DynamicGameObj {
    public focused: boolean = false;
    frame_time = 0;
    has_jump = false;
    slide = false;
    wall_slide = false;
    running = false;
    jump = false;
    jump_dir = 0;
    constructor(size: number[], pos: number[]) {
        super(new Vec2(size[0], size[1]), new Vec2(pos[0], pos[1]));
        this.object_tag = ObjectTag.Player;
        this.hitbox = new Hitbox(
            this.size.div(new Vec2(2, 4 / 3)),
            this.pos.sub(new Vec2(this.size.x / 4, this.size.y / 4))
        );
        this.hb_pos_diff = new Vec2(this.size.x / 4, this.size.x / 4);
        this.mass = 1;
        this.reactive = true;
        this.focused = true;
    }

    get grounded() {
        return this.collision_dir(CollisionDir.Bottom);
    }

    run(delta_time: number): void {
        this.clear();
        super.collision(delta_time);
        this.keyboard_events();
        this.movement(delta_time);

        this.set_animations(delta_time);
        this.animate(this.frame_time);

        super.motion(delta_time);
        super.run(delta_time);
        this.add_force(new Vec2(0, gravity * this.mass));
    }

    clear() {
        this.jump_dir = 0;
        this.running = false;
        this.jump = false;
        this.has_jump = false;
        this.slide = false;
        this.wall_slide = false;
    }

    keyboard_events() {
        if (event.key_state(Keys.A, EventType.Down)) {
            this.running = true;
            this.x_direction = -1;
        } else if (event.key_state(Keys.D, EventType.Down)) {
            this.running = true;
            this.x_direction = 1;
        }
        if (event.key_state(Keys.W, EventType.Pressed)) {
            this.jump = true;
        }
        if (event.key_state(Keys.Shift, EventType.Down)) {
            this.slide = true;
        }
    }

    movement(delta_time: number) {
        if (this.running) {
            this.velocity.x +=
                (6 * this.x_direction - this.velocity.x) * 0.05 * delta_time;
        } else {
            this.velocity.x += (0 - this.velocity.x) * 0.08 * delta_time;
        }
        if ((this.grounded || this.has_jump) && this.jump) {
            this.velocity.y = -12;
            this.velocity.x = this.jump_dir * 10;
            // console.log(this.jump_dir);
        }
        if (this.slide) {
            if (this.velocity.x * this.x_direction > 0) {
                this.velocity.x -= 0.1 * this.x_direction * delta_time;
            }
        }

        if (this.wall_slide) {
            this.velocity.y += (0 - this.velocity.y) * 0.08 * delta_time;
            this.force.y = 0;
        }
    }

    set_animations(delta_time: number) {
        this.frame_time = 0;
        if (this.wall_slide) {
            this.sprite_index = 4;
            this.x_direction *= -1;
            return;
        } else if (!this.grounded) {
            this.sprite_index = 2;
            return;
        }
        if (!this.running && Math.abs(this.velocity.x) < 0.2 * delta_time) {
            this.sprite_index = 1;
        } else if (
            !this.running &&
            Math.abs(this.velocity.x) < 3 * delta_time
        ) {
            this.sprite_index = 5;
        } else {
            this.frame_time = (1 / Math.abs(this.velocity.x)) * 350;
            this.sprite_index = 0;
        }
    }

    on_collision_x(obj: GameObject, dir: CollisionDir): void {
        super.on_collision_x(obj, dir);
        if (!this.grounded) {
            this.wall_slide = true;
            this.has_jump = true;
            this.jump_dir = this.x_direction;
        }
        this.running = false;
    }
}
