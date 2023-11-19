import { camera, event, gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { Effect, PlayerEffects } from "../base/effects";
import { EventType, Keys } from "../base/event_handler";
import {
    CollisionDir,
    StaticCollisionObj,
    DynamicGameObj,
    GameObject,
    Hitbox,
    HitboxFlags,
    ObjectTag,
} from "../base/gameobject";
import { float_eq, float_less_eq } from "../base/rays";
import { SpriteSheets } from "../base/textures";
import { Pisti } from "./pisti";
import { Melee, Ranged, Teleport } from "./weapon/weapon";

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
    ranged_weapon: Ranged;
    melee_weapon: Melee;
    teleport: Teleport;

    constructor(size: number[], pos: number[]) {
        super(new Vec2(size[0], size[1]), new Vec2(pos[0], pos[1]));
        this.object_tag = ObjectTag.Player;
        this.mass = 1;
        this.hitboxes[0].size = this.size.div(new Vec2(4, 4 / 3));
        this.hitboxes[0].pos_diff = new Vec2(
            (this.size.x / 4) * 1.5,
            this.size.x / 4
        );

        this.ranged_weapon = new Ranged(this, 60);
        this.melee_weapon = new Melee(this, 30);
        this.teleport = new Teleport(this, 0);

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
        this.set_attack();
        this.animate(this.frame_time);
        this.clear();
    }

    clear() {
        this.jump_dir = 0;
        this.jump = false;
        this.x_collision = false;
        this.has_jump = false;
        this.dash = false;
        this.wall_slide = false;
        this.animation_direction = 1;
        this.halt_points = [];
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
            this.pos.set(Math.random() * 1200, -300);
            this.set_hb_position();
        }
        if (event.key_state(Keys.W, EventType.Pressed)) {
            this.jump = true;
        }
        if (
            !this.melee_weapon.attacking &&
            event.key_state(Keys.J, EventType.Pressed)
        ) {
            this.melee_weapon.pressed = true;
        }
        if (
            !this.ranged_weapon.attacking &&
            event.key_state(Keys.K, EventType.Pressed)
        ) {
            this.ranged_weapon.pressed = true;
        }

        if (
            !this.teleport.attacking &&
            event.key_state(Keys.I, EventType.Pressed)
        ) {
            this.teleport.pressed = true;
        }
    }

    set_attack() {
        this.ranged_weapon.run();
        this.melee_weapon.run();
        this.teleport.run();
    }

    movement(delta_time: number) {
        this.add_force(new Vec2(0, gravity * this.mass));

        if (
            this.dash &&
            !(!this.x_collision && Math.abs(this.velocity.x) > 7)
        ) {
            this.velocity.x = 25 * this.x_direction;
            this.ranged_weapon.attacking = false;
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
                SpriteSheets.PlayerEffects,
                PlayerEffects.Grounded,
                100,
                0
            );
            this.grounded_effect = true;
        }

        if (!this.grounded) {
            this.grounded_effect = false;
            this.ranged_weapon.attacking = false;
        }

        if (this.dash && !this.x_collision && Math.abs(this.velocity.x) > 7) {
            new Effect(
                Vec2.from(this.size),
                this.pos,
                this.x_direction,
                SpriteSheets.PlayerEffects,
                PlayerEffects.Dash,
                50,
                0
            );
        }

        this.frame_time = 0;
        this.sprite_index = 1;

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
            if (
                !float_eq(this.velocity.y, 0) ||
                Math.abs(this.velocity.x) > 3
            ) {
                this.ranged_weapon.attacking = false;
            }
            this.frame_time = (1 / Math.abs(this.velocity.x)) * 250;
            this.sprite_index = 0;
        }
    }

    on_dynamic_collision(obj: {
        this_hitbox: Hitbox;
        obj_hitbox: Hitbox;
        obj: DynamicGameObj;
    }): void {}

    on_collision(obj: StaticCollisionObj): void {
        super.on_collision(obj);
    }

    on_collision_x(obj: StaticCollisionObj): void {
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

    on_collision_y(obj: StaticCollisionObj): void {
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
