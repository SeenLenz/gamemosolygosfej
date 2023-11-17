import { camera, event, gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { Effect } from "../base/effects";
import { EventType, Keys } from "../base/event_handler";
import {
    CollisionDir,
    CollisionObj,
    DynamicGameObj,
    GameObject,
    Hitbox,
    HitboxFlags,
    ObjectTag,
} from "../base/gameobject";
import { float_eq, float_less_eq } from "../base/rays";
import { SpriteSheets } from "../base/textures";

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
    grounded_effect = false;
    platform_fall = false;

    attacks = {
        melee: {
            pressed: false,
            attacking: false,
            combo_count: 0,
            combo_timer: 0,
        },
        ranged: false,
    };
    constructor(size: number[], pos: number[]) {
        super(new Vec2(size[0], size[1]), new Vec2(pos[0], pos[1]));
        this.object_tag = ObjectTag.Player;
        this.mass = 1;
        this.hitboxes[0].size = this.size.div(new Vec2(4, 4 / 3));
        this.hitboxes[0].pos_diff = new Vec2(
            (this.size.x / 4) * 1.5,
            this.size.x / 4
        );

        this.focused = true;
    }

    get grounded() {
        return this.hitboxes[0].collision_dir(CollisionDir.Bottom);
    }

    get hitbox() {
        return this.hitboxes[0];
    }

    run(delta_time: number): void {
        this.keyboard_events(delta_time);
        this.movement(delta_time);
        this.set_animations(delta_time);
        this.animate(this.frame_time);
        this.clear();
        this.attack();
    }

    clear() {
        this.jump_dir = 0;
        this.jump = false;
        this.x_collision = false;
        this.has_jump = false;
        this.dash = false;
        this.wall_slide = false;
    }

    keyboard_events(delta_time: number) {
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

        if (event.key_state(Keys.Shift, EventType.Pressed)) {
            this.dash = true;
        }
        if (event.key_state(Keys.S, EventType.Pressed)) {
            this.platform_fall = true;
        }
        if (event.key_state(Keys.R, EventType.Pressed)) {
            this.pos.set(0, -200);
        }
        if (event.key_state(Keys.W, EventType.Pressed)) {
            this.jump = true;
        }
        if (
            !this.attacks.melee.attacking &&
            event.key_state(Keys.J, EventType.Pressed)
        ) {
            this.attacks.melee.pressed = true;
        }
    }

    attack() {
        if (this.attacks.melee.pressed) {
            switch (this.attacks.melee.combo_count) {
                case 0:
                    this.velocity.x += 9 * this.x_direction;
                    this.attacks.melee.combo_timer = performance.now();
                    new Effect(
                        Vec2.from(this.size),
                        this.pos,
                        this.x_direction,
                        SpriteSheets.Melee0,
                        0,
                        30,
                        0
                    );
                    break;
                case 1:
                    this.velocity.x += 9 * this.x_direction;
                    this.attacks.melee.combo_timer = performance.now();
                    break;

                case 2:
                    this.velocity.x += 12 * this.x_direction;
                    if (this.grounded) {
                        this.velocity.y -= 8;
                    }
                    break;
            }
            this.attacks.melee.attacking = true;
        }
        this.attacks.melee.pressed = false;
        if (performance.now() - this.attacks.melee.combo_timer > 500) {
            this.attacks.melee.combo_count = 0;
        }
        if (performance.now() - this.attacks.melee.combo_timer > 400) {
            this.attacks.melee.attacking = false;
            if (this.attacks.melee.combo_count > 2) {
                this.attacks.melee.combo_count = 0;
            }
        }
    }

    movement(delta_time: number) {
        this.add_force(new Vec2(0, gravity * this.mass));

        if (
            this.dash &&
            !(!this.x_collision && Math.abs(this.velocity.x) > 7)
        ) {
            this.velocity.x = 25 * this.x_direction;
            this.attacks.melee.attacking = false;
        }
        if (this.running && Math.abs(this.velocity.x) < 7) {
            this.velocity.x +=
                (6 * this.x_direction - this.velocity.x) * 0.04 * delta_time;
        } else {
            this.velocity.x += (0 - this.velocity.x) * 0.08 * delta_time;
        }

        if ((this.grounded || this.has_jump) && this.jump) {
            this.velocity.y = -12;
            this.velocity.x += this.jump_dir * 8;
        }

        if (this.wall_slide) {
            this.velocity.y += (0 - this.velocity.y) * 0.08 * delta_time;
            this.force.y = 0;
        }
    }

    set_animations(delta_time: number) {
        if (this.grounded && !this.grounded_effect) {
            new Effect(
                Vec2.from(this.size),
                Vec2.from(this.pos),
                this.x_direction,
                SpriteSheets.GroundedEffect,
                0,
                100,
                0
            );
            this.grounded_effect = true;
        }

        if (!this.grounded) {
            this.grounded_effect = false;
        }

        if (this.dash && !this.x_collision && Math.abs(this.velocity.x) > 7) {
            new Effect(
                Vec2.from(this.size),
                this.pos,
                this.x_direction,
                SpriteSheets.DashEffect,
                0,
                50,
                0
            );
        }

        this.frame_time = 0;
        if (this.wall_slide) {
            this.sprite_index = 3;
            this.x_direction *= -1;
            return;
        } else if (!this.x_collision && Math.abs(this.velocity.x) > 7) {
            this.sprite_index = 4;
            return;
        } else if (!this.grounded && Math.abs(this.velocity.x) > 1) {
            this.frame_time = (1 / Math.abs(this.velocity.y)) * 400;
            this.sprite_index = 2;
            return;
        }
        if (this.running) {
            this.frame_time = (1 / Math.abs(this.velocity.x)) * 250;
            this.sprite_index = 0;
        } else {
            this.sprite_index = 1;
        }
    }

    on_collision(obj: CollisionObj): void {
        if (obj.obj_hitbox.has_flag(HitboxFlags.Enemy)) {
            if (this.attacks.melee.pressed) {
                (obj.obj as DynamicGameObj).velocity.y = -3;
                (obj.obj as DynamicGameObj).velocity.x = 12 * this.x_direction;
            }
        }

        super.on_collision(obj);
    }

    on_collision_x(obj: CollisionObj): void {
        if (!obj.obj_hitbox.reactive) {
            return;
        }
        if (!this.grounded) {
            this.wall_slide = true;
            this.has_jump = true;
            this.jump_dir = this.x_direction;
        }
        this.sprite_index = 1;
        this.running = false;
        this.x_collision = true;

        super.on_collision_x(obj);
    }

    on_collision_y(obj: CollisionObj): void {
        if (
            obj.obj_hitbox.flags.includes(HitboxFlags.Platform) &&
            this.platform_fall
        ) {
            return;
        }
        this.platform_fall = false;

        super.on_collision_y(obj);
    }
}
