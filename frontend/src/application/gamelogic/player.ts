import { Networkable, ObjType, Type } from "../../../../types";
import { camera, event, gravity, huuud, network } from "../../app";
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
    Empty,
} from "../base/gameobject";
import { float_eq } from "../base/rays";
import { SpriteSheets } from "../base/textures";
import { WorkerMsg } from "../../networking/WorkerMsg";
import { v4 as uuid } from "uuid";
import { Melee, Ranged, Teleport } from "./weapon/weapon";
import { Gameped } from "../../app";
import { GamepadButtons } from "../base/gamepad_handler";

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
    bt_held = false;
    ranged_weapon: Ranged;
    melee_weapon: Melee;
    teleport: Teleport;
    damagable = true;
    damaged_timer = performance.now();
    health = 8;
    used_potion = false;

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

        this.ranged_weapon = new Ranged(this, 3, 600);
        this.melee_weapon = new Melee(this, 2);
        this.teleport = new Teleport(this, 0);

        if (!remote) {
            this.remote_id = uuid();

            network.send(
                new WorkerMsg(Type.crt, {
                    type: ObjType.player,
                    pos,
                    size,
                    remote_id: this.remote_id,
                })
            );
        } else {
            this.texture_index = SpriteSheets.Huba;
            this.remote_id = remote_id as String;
            this.run = (delta_time: number) => {
                this.add_force(new Vec2(0, gravity * this.mass));
                this.movement(delta_time);
                this.set_attack();
                this.animate(this.frame_time);
                this.clear();
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
        this.ranged_weapon.pressed = data.ranged_press;
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
                    ranged_press: this.ranged_weapon.pressed,
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
        this.keyboard_events(delta_time);
        this.movement(delta_time);
        this.set_animations(delta_time);
        this.set_attack();
        this.animate(this.frame_time);
        this.out();
        this.clear();
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
        this.ranged_weapon.pressed = false;
        this.melee_weapon.pressed = false;
        this.teleport.pressed = false;
        if (!this.remote) {
            this.halt_points = [];
        }
        this.used_potion = false;
    }

    keyboard_events(delta_time: number) {
        if (
            event.key_state(Keys.A, EventType.Down) ||
            Gameped.isPressed(GamepadButtons.Left)
        ) {
            this.running = true;
            this.x_direction = -1;
            this.network_sync = true;
        } else if (
            event.key_state(Keys.D, EventType.Down) ||
            Gameped.isPressed(GamepadButtons.Right)
        ) {
            this.running = true;
            this.x_direction = 1;
            this.network_sync = true;
        } else if (
            event.key_state(Keys.A, EventType.Up) ||
            event.key_state(Keys.A, EventType.Up)
        ) {
            this.running = false;
        }

        if (
            event.key_state(Keys.Shift, EventType.Pressed) ||
            Gameped.isPressed(GamepadButtons.X)
        ) {
            this.dash = true;
            this.network_sync = true;
        }
        if (
            event.key_state(Keys.S, EventType.Pressed) ||
            Gameped.isPressed(GamepadButtons.Down)
        ) {
            this.platform_fall = true;
            this.network_sync = true;
        }
        if (
            event.key_state(Keys.Space, EventType.Pressed) ||
            Gameped.isPressed(GamepadButtons.A)
        ) {
            this.network_sync = true;
            this.jump = true;
        }
        if (
            (!this.melee_weapon.attacking &&
                event.key_state(Keys.J, EventType.Pressed)) ||
            (!this.melee_weapon.attacking &&
                Gameped.isPressed(GamepadButtons.RT))
        ) {
            this.melee_weapon.pressed = true;
            this.network_sync = true;
            this.ranged_weapon.can_attack = false;
            this.ranged_weapon.attacking = false;
        }
        if (
            (!this.ranged_weapon.attacking &&
                event.key_state(Keys.K, EventType.Pressed)) ||
            (!this.melee_weapon.attacking &&
                Gameped.isPressed(GamepadButtons.LT))
        ) {
            this.network_sync = true;
            this.ranged_weapon.pressed = true;
        }

        if (
            (!this.teleport.attacking &&
                event.key_state(Keys.I, EventType.Pressed)) ||
            (!this.melee_weapon.attacking &&
                Gameped.isPressed(GamepadButtons.B))
        ) {
            this.network_sync = true;
            this.teleport.pressed = true;
        }
        if (event.key_state(Keys.F, EventType.Pressed)) {
            if (huuud.current_health != 8 && huuud.potion_parent_div.children.length != 0) {
                this.used_potion = true;
            }
        }
    }
    damage_taken(damage: number, hit_dir: number) {
        if (this.damagable) {
            this.damagable = false;
            this.health -= damage;
            this.damaged_timer = performance.now();
            this.velocity.x += (damage / 5) * hit_dir;
            this.velocity.y -= 2;
            huuud.set_health_bar(damage, -1);

            if (this.health <= 0) {
                console.log(this.remote);
                if (this.remote == false) {
                    camera.focus_on(new Empty(this.pos));
                }
                network.outBuff_add(
                    new WorkerMsg(Type.sync, {
                        death: true,
                        this: this.remote_id,
                    })
                );
                this.remove();
            }
        }
        super.damage_taken(damage, hit_dir);
    }
    health_potion_used() {    
        if (this.health + 2 > 8) {
            this.health += 1;
            huuud.set_health_bar(1, 1);                
        }
        else {
            this.health += 2;
            huuud.set_health_bar(2, 1);
        }        
    }
    set_attack() {
        this.ranged_weapon.run();
        this.melee_weapon.run();
        this.teleport.run();
    }

    movement(delta_time: number) {
        if (performance.now() - this.damaged_timer > 300) {
            this.damagable = true;
        }
        if (!this.damagable) {
            this.running = false;
            this.jump = false;
            this.wall_slide = false;
        }

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

        if (this.used_potion) {
            this.health_potion_used();
            const potion = huuud.potion_parent_div.lastChild;
            if (potion) {
                huuud.potion_parent_div.removeChild(potion);
            }
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
