import { Type } from "../../../../../types";
import { RemoteBuff, delta_time, network } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { WorkerMsg } from "../../../networking/WorkerMsg";
import { Effect, PlayerEffects } from "../../base/effects";
import { DynamicGameObj, ObjectTag } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { Player } from "../player";
import { player } from "../roles/role";

export enum WeaponOwner {
    Player,
    Enemy,
}

export enum WeaponType {
    ranged,
    melee,
    teleport,
}

export class Weapon {
    parent_obj: DynamicGameObj;
    animation_timer = 0;
    pressed = false;
    attacking = false;
    can_attack = false;
    attacked = false;
    _attack_lock = false;
    base_timer = 0;
    combo_count = 0;

    weapon_type: WeaponType;

    cast_time = 0;
    attack_delay = 0;

    multi_target = false;
    target_objects: {
        all: DynamicGameObj[];
        closest: DynamicGameObj | undefined;
    };

    power: number;
    crit: number = 0;
    range: number;
    range_offset: number;
    angle: number;
    hit_timer = 0;
    constructor(
        obj: DynamicGameObj,
        power: number,
        range: number,
        angle: number,
        range_offset = 0
    ) {
        this.weapon_type = WeaponType.melee;
        this.parent_obj = obj;
        this.power = power;
        this.angle = angle;
        this.range = range;
        this.range_offset = range_offset;
        this.target_objects = { all: [], closest: undefined };
    }

    set_target_objs() {
        if (this.parent_obj.object_tag == ObjectTag.Player) {
            this.target_objects = this.parent_obj.get_dynamic_objs_in_section(
                this.range,
                Vec2.X(this.parent_obj.x_direction),
                this.angle,
                this.range_offset
            );
        } else {
            const dist = this.parent_obj.hitboxes[0].middle.dist_squared(
                player.hitbox.middle
            );
            if (
                dist < this.range * this.range &&
                dist > this.range_offset * this.range_offset
            ) {
                this.target_objects = {
                    all: [player],
                    closest: player,
                };
            } else {
                this.target_objects = {
                    all: [],
                    closest: undefined,
                };
            }
        }
    }

    run() {
        const now = performance.now();
        if (this.pressed) {
            this.attacking = true;
            this.base_timer = performance.now();
            this.parent_obj.current_frame = 0;
            this.can_attack = true;
            this._attack_lock = true;
            this.parent_obj.network_sync = true;
        }
        this.attacked = false;

        if (now - this.base_timer > this.cast_time) {
            this.attacking = false;
        }

        if (this.attacking && now - this.base_timer > this.attack_delay) {
            if (this.can_attack) {
                if (this._attack_lock) {
                    this.attacked = true;
                    this._attack_lock = false;
                }
                if (!this.multi_target) {
                    this.set_target_objs();
                    if (this.target_objects.closest) {
                        this.on_hit({
                            all: [this.target_objects.closest],
                            closest: this.target_objects.closest,
                        });
                    }
                } else {
                    this.on_hit(this.target_objects);
                    this.set_target_objs();
                }
            }
        }

        this.weapon_logic();
        if (!(this.parent_obj as DynamicGameObj).remote) {
            this.set_animation();
        }
    }

    weapon_logic() {}
    set_animation() {}
    on_hit(objs: {
        all: DynamicGameObj[];
        closest: DynamicGameObj | undefined;
    }) {
        objs.all.forEach((obj) => {
            network.outBuff_add(
                new WorkerMsg(Type.sync, {
                    hit: true,
                    remote_id: obj.remote_id,
                    damage: this.power + this.crit,
                    hit_dir: this.parent_obj.x_direction,
                })
            );
        });
    }
}

export class Ranged extends Weapon {
    projectile: Effect | undefined;
    direction = Vec2.zeros();
    speed = 30;
    distance = 0;
    constructor(obj: DynamicGameObj, power: number, range: number) {
        super(obj, power, range, Math.PI / 3);
        this.attack_delay = 900;
        this.cast_time = 1100;
        this.weapon_type = WeaponType.ranged;
    }

    set_animation(): void {
        if (this.attacking) {
            this.parent_obj.frame_time = 40;
            this.parent_obj.sprite_index = 6;
            this.parent_obj.halt_points = [
                { frame: 4, time: 200 },
                { frame: 8, time: 300 },
                { frame: 9, time: 300 },
            ];
        }

        if (this.attacked) {
            new Effect(
                this.parent_obj.size,
                this.parent_obj.pos,
                this.parent_obj.x_direction,
                SpriteSheets.PlayerEffects,
                PlayerEffects.Ranged,
                50,
                0,
                Vec2.X(5 * 6 * this.parent_obj.x_direction),
                false,
                false,
                this.parent_obj.remote_id
            );
        }
    }

    weapon_logic(): void {
        if (!this.target_objects.closest) {
            return;
        }

        if (!this.projectile) {
            return;
        }

        this.projectile.pos.add_self(
            this.direction.mul(Vec2.uniform(this.speed * delta_time))
        );

        if (
            Math.abs(
                this.projectile.pos.x -
                    this.target_objects.closest.hitboxes[0].middle.x
            ) <=
            this.speed * 5 * delta_time
        ) {
            if (this.target_objects.closest.object_tag == ObjectTag.Player) {
                let player = this.target_objects.closest as Player;
                if (
                    player.melee_weapon.attacking ||
                    player.ranged_weapon.attacked ||
                    player.teleport.attacking ||
                    player.dash
                ) {
                    this.projectile.remove();
                    this.projectile = undefined;
                    return;
                }
            }
        }

        if (
            Math.abs(
                this.projectile.pos.x -
                    this.target_objects.closest.hitboxes[0].middle.x
            ) <=
            this.speed * delta_time
        ) {
            this.projectile.remove();
            this.projectile = undefined;
            if (!this.parent_obj.remote) {
                super.on_hit({
                    all: [this.target_objects.closest],
                    closest: this.target_objects.closest,
                });
            }
        }
    }

    start_bullet(obj: DynamicGameObj) {
        this.projectile = new Effect(
            new Vec2(9, 6),
            this.parent_obj.hitboxes[0].middle.sub(Vec2.Y(24)),
            0,
            SpriteSheets.Debug,
            0,
            0,
            -1,
            Vec2.X(5 * 6 * this.parent_obj.x_direction),
            false,
            false,
            undefined,
            false
        );

        this.direction = obj.hitboxes[0].middle
            .sub(this.parent_obj.hitboxes[0].middle)
            .normalize();
    }

    on_hit(objs: {
        all: DynamicGameObj[];
        closest: DynamicGameObj | undefined;
    }): void {
        if (!objs.closest) {
            return;
        }

        this.start_bullet(objs.closest);
        this.can_attack = false;
        this.hit_timer = performance.now();
    }
}

export class Melee extends Weapon {
    constructor(obj: DynamicGameObj, power: number) {
        super(obj, power, 80, Math.PI / 1.5);
        this.attack_delay = 0;
        this.cast_time = 7 * 40;
        this.multi_target = true;
    }

    set_animation(): void {
        if (this.attacking) {
            this.parent_obj.frame_time = 40;
            this.parent_obj.sprite_index = 5;
            this.parent_obj.animation_direction = 1;
            if (this.combo_count % 2 == 0) {
                this.parent_obj.animation_direction = -1;
            }
        }

        if (this.attacked) {
            let effect = PlayerEffects.MeleeC0;
            if (this.combo_count % 2 == 0) {
                effect = PlayerEffects.MeleeC1;
            }
            new Effect(
                this.parent_obj.size,
                this.parent_obj.pos,
                this.parent_obj.x_direction,
                SpriteSheets.PlayerEffects,
                effect,
                40,
                0,
                Vec2.zeros(),
                false,
                false,
                this.parent_obj.remote_id
            );
        }
    }

    on_hit(objs: {
        all: DynamicGameObj[];
        closest: DynamicGameObj | undefined;
    }): void {
        super.on_hit(objs);
    }

    weapon_logic(): void {
        if (this.attacked) {
            this.crit = 0;
            this.parent_obj.velocity.x += 9 * this.parent_obj.x_direction;
            this.combo_count = (this.combo_count + 1) % 2;
            if (this.combo_count % 2 == 0) {
                this.crit += 20;
            }
            this.crit += this.parent_obj.velocity.magnitude;
        }

        if (performance.now() - this.base_timer > 11 * 40) {
            this.combo_count = 0;
        }
    }
}

export class Teleport extends Weapon {
    constructor(obj: DynamicGameObj, power: number) {
        super(obj, power, 500, Math.PI / 2);
        this.cast_time = 1000;
        this.range_offset = 100;
        this.attack_delay = 100;
        this.weapon_type = WeaponType.teleport;
    }

    set_animation(): void {
        if (this.pressed && this.target_objects.closest != undefined) {
            new Effect(
                this.parent_obj.size,
                Vec2.from(this.parent_obj.pos),
                this.parent_obj.x_direction,
                SpriteSheets.PlayerEffects,
                PlayerEffects.Teleport,
                50,
                0
            );
        }

        if (this.attacked && this.target_objects.closest != undefined) {
            this.parent_obj.network_sync = true;
            new Effect(
                this.parent_obj.size,
                Vec2.from(this.parent_obj.pos),
                this.parent_obj.x_direction,
                SpriteSheets.PlayerEffects,
                PlayerEffects.Teleport,
                50,
                0
            );
        }
    }

    on_hit(objs: {
        all: DynamicGameObj[];
        closest: DynamicGameObj | undefined;
    }): void {
        this.can_attack = false;
        if (objs.closest && this.attacked) {
            this.parent_obj.pos.y = objs.closest.pos.y;
            this.parent_obj.pos.x =
                objs.closest.pos.x -
                this.range_offset * this.parent_obj.x_direction;
            this.parent_obj.set_hb_position();

            super.on_hit(objs);
        }
    }
}
