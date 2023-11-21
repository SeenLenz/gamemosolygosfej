import { Networkable, ObjType, Type } from "../../../../types";
import {
    camera,
    event,
    gravity,
    network,
    renderer,
    RemoteBuff,
} from "../../app";
import { Vec2 } from "../../lin_alg";
import { Effect, PlayerEffects } from "../base/effects";
import { EventType, Keys } from "../base/event_handler";
import {
    CollisionDir,
    StaticCollisionObj,
    DynamicGameObj,
    Hitbox,
    HitboxFlags,
    ObjectTag,
} from "../base/gameobject";
import { float_eq, float_less_eq } from "../base/rays";
import { SpriteSheets } from "../base/textures";
import { WorkerMsg } from "../../networking/WorkerMsg";
import { v4 as uuid } from "uuid";
import { Melee, Ranged, Teleport } from "./weapon/weapon";

export class Player extends DynamicGameObj implements Networkable {
    public focused: boolean = false;
    has_jump = false;
    dash = false;
    wall_slide = false;
    running = false;
    jump = false;
    jump_dir = 0;
    x_collision = false;
    grounded_effect = false;
    platform_fall = false;
    remote: boolean;
    bt_held = false;
    ranged_weapon: Ranged;
    melee_weapon: Melee;
    teleport: Teleport;
    damagable = true;
    damaged_timer = performance.now();
    health = 100;

    constructor(
        size: number[],
        pos: number[],
        remote: boolean,
        remote_id: String | undefined
    ) {
        super(new Vec2(size[0], size[1]), new Vec2(pos[0], pos[1]));
        this.object_tag = ObjectTag.Player;
        this.mass = 1;
        this.velocity = new Vec2(0, 0);
        //network setup
        this.remote = remote;
        this.hitboxes[0].size = this.size.div(new Vec2(4, 4 / 3));
        this.hitboxes[0].pos_diff = new Vec2(
            (this.size.x / 4) * 1.5,
            this.size.x / 4
        );

        this.ranged_weapon = new Ranged(this, 60, 600);
        this.melee_weapon = new Melee(this, 30);
        this.teleport = new Teleport(this, 0);

        if (!remote) {
            this.remote_id = uuid();

            console.log(this.remote_id);

            network.send(
                new WorkerMsg(Type.crt, {
                    type: ObjType.player,
                    pos,
                    size,
                    remote_id: this.remote_id,
                })
            );
        } else {
            this.remote_id = remote_id as String;
            this.run = (delta_time: number) => {
                this.add_force(new Vec2(0, gravity * this.mass));
                this.clear();
                this.movement(delta_time);
                // this.set_animations(delta_time);
                this.animate(this.frame_time);
            };
        }
    }

    in(data: any) {
        this.x_direction = data.x_dir;
        this.velocity = new Vec2(data.vel.x, data.vel.y);
        this.pos = new Vec2(data.pos.x, data.pos.y);
        this.frame_time = data.frame_time;
        this.sprite_index = data.sprite_index;
        this.halt_points = data.halt_points;
    }

    out() {
        //velocity
        //position
        //sprite index
        //framte time
        if (this.network_sync) {
            network.outBuff_add(
                new WorkerMsg(Type.sync, {
                    x_dir: this.x_direction,
                    type: ObjType.player,
                    vel: this.velocity,
                    pos: this.pos,
                    frame_time: this.frame_time,
                    sprite_index: this.sprite_index,
                    remote_id: this.remote_id,
                    halt_points: this.halt_points,
                })
            );
        }
    }

    del() {
        return false;
    }

    get grounded() {
        return this.hitboxes[0].collision_dir(CollisionDir.Bottom);
    }

    get hitbox() {
        return this.hitboxes[0];
    }

    run(delta_time: number): void {
        this.add_force(new Vec2(0, gravity * this.mass));
        this.clear();
        this.keyboard_events(delta_time);
        this.movement(delta_time);
        this.set_animations(delta_time);
        this.set_attack();
        this.animate(this.frame_time);
        this.out();
    }

    clear() {
        this.jump_dir = 0;
        this.network_sync = false;
        this.jump = false;
        this.x_collision = false;
        this.has_jump = false;
        this.dash = false;
        this.wall_slide = false;
        this.animation_direction = 1;
        if (!this.remote) {
            this.halt_points = [];
        }
    }

    keyboard_events(delta_time: number) {
        if (event.key_state(Keys.A, EventType.Down)) {
            this.running = true;
            this.x_direction = -1;
            this.network_sync = true;
        } else if (event.key_state(Keys.D, EventType.Down)) {
            this.running = true;
            this.x_direction = 1;
            this.network_sync = true;
        } else if (
            event.key_state(Keys.A, EventType.Up) ||
            event.key_state(Keys.A, EventType.Up)
        ) {
            this.running = false;
        }
        if (event.key_state(Keys.W, EventType.Pressed)) {
            this.jump = true;
            this.network_sync = true;
        }
        if (event.key_state(Keys.Shift, EventType.Pressed)) {
            this.dash = true;
            this.network_sync = true;
        }
        if (event.key_state(Keys.S, EventType.Pressed)) {
            this.platform_fall = true;
            this.network_sync = true;
        }
        if (event.key_state(Keys.Space, EventType.Pressed)) {
            this.network_sync = true;
        }
        if (event.key_state(Keys.Space, EventType.Pressed)) {
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

    damage_taken(damage: number, hit_dir: number) {
        if (this.damagable) {
            this.damagable = false;
            this.health -= damage;
            this.damaged_timer = performance.now();
            this.velocity.x += (damage / 5) * hit_dir;
            this.velocity.y -= 2;

            if (this.health <= 0) {
                console.log("died");
            }
        }
        super.damage_taken(damage, hit_dir);
    }

    set_attack() {
        this.ranged_weapon.run();
        this.melee_weapon.run();
        this.teleport.run();
    }

    movement(delta_time: number) {
        if (
            this.dash &&
            !(!this.x_collision && Math.abs(this.velocity.x) > 7)
        ) {
            this.velocity.x = 25 * this.x_direction;
            // this.ranged_weapon.attacking = false;
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
            console.log(this.remote_id);
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
                0,
                Vec2.zeros(),
                false,
                false,
                this.remote_id
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
