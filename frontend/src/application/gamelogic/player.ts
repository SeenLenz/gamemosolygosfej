import { SpriteSheets, event, gravity } from "../../app";
import { Vec2 } from "../../lin_alg";
import { Effect } from "../base/effects";
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
    dash = false;
    wall_slide = false;
    running = false;
    jump = false;
    jump_dir = 0;
    x_collision = false;

    start_effect = false;
    constructor(size: number[], pos: number[]) {
        super(new Vec2(size[0], size[1]), new Vec2(pos[0], pos[1]));
        this.object_tag = ObjectTag.Player;
        this.hitbox = new Hitbox(
            this.size.div(new Vec2(4, 4 / 3)),
            this.pos.sub(new Vec2((this.size.x / 4) * 1.5, this.size.y / 4))
        );
        this.hb_pos_diff = new Vec2((this.size.x / 4) * 1.5, this.size.x / 4);
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
    }

    clear() {
        this.jump_dir = 0;
        this.jump = false;
        this.x_collision = false;
        this.has_jump = false;
        this.dash = false;
        this.wall_slide = false;
    }

    keyboard_events() {
        if (event.key_state(Keys.A, EventType.Down)) {
            this.running = true;
            this.x_direction = -1;
        } else if (event.key_state(Keys.D, EventType.Down)) {
            this.running = true;
            this.x_direction = 1;
        } else if (
            event.key_state(Keys.A, EventType.Up) ||
            event.key_state(Keys.A, EventType.Up)
        ) {
            this.running = false;
        }
        if (event.key_state(Keys.W, EventType.Pressed)) {
            this.jump = true;
        }
        if (event.key_state(Keys.Shift, EventType.Pressed)) {
            this.dash = true;
        }
    }

    movement(delta_time: number) {
        this.add_force(new Vec2(0, gravity * this.mass));
        if (this.dash) {
            this.velocity.x = 20 * this.x_direction;
        }
        if (this.running) {
            this.velocity.x +=
                (6 * this.x_direction - this.velocity.x) * 0.07 * delta_time;
        } else {
            this.velocity.x += (0 - this.velocity.x) * 0.08 * delta_time;
        }

        if ((this.grounded || this.has_jump) && this.jump) {
            this.velocity.y = -12;
            this.velocity.x += this.jump_dir * 15;
        }

        if (this.wall_slide) {
            this.hitbox.size = this.size.div(new Vec2(2, 4 / 3));
            this.hb_pos_diff = new Vec2(this.size.x / 4, this.size.x / 4);
            this.velocity.y += (0 - this.velocity.y) * 0.08 * delta_time;
            this.force.y = 0;
        } else {
            this.hitbox.size = this.size.div(new Vec2(4, 4 / 3));
            this.hb_pos_diff = new Vec2(
                (this.size.x / 4) * 1.5,
                this.size.x / 4
            );
        }
    }

    set_animations(delta_time: number) {
        if (this.grounded && !this.start_effect) {
            new Effect(
                this.size,
                this.pos,
                SpriteSheets.GroundedEffect,
                0,
                100,
                0
            );
            this.start_effect = true;
        }

        if (!this.grounded) {
            this.start_effect = false;
        }

        this.frame_time = 0;
        this.sprite_index = 1;
        if (this.wall_slide) {
            this.sprite_index = 4;
            this.x_direction *= -1;
            return;
        } else if (!this.x_collision && Math.abs(this.velocity.x) > 7) {
            this.sprite_index = 3;
            return;
        } else if (!this.grounded) {
            this.sprite_index = 2;
            return;
        }
        if (Math.abs(this.velocity.x) < 0.5) {
            this.sprite_index = 1;
        } else if (Math.abs(this.velocity.x) < 3) {
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
        this.x_collision = true;
    }
}
