import { Vec2 } from "../../../lin_alg";
import { Effect, PlayerEffects } from "../../base/effects";
import { DynamicGameObj } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { Pisti } from "../pisti";

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
    constructor(
        obj: DynamicGameObj,
        power: number,
        range: number,
        angle: number,
        range_offset = 0
    ) {
        this.parent_obj = obj;
        this.power = power;
        this.angle = angle;
        this.range = range;
        this.range_offset = range_offset;
        this.target_objects = { all: [], closest: undefined };
    }

    run() {
        const now = performance.now();
        if (this.pressed) {
            this.attacking = true;
            this.base_timer = performance.now();
            this.parent_obj.current_frame = 0;
            this.can_attack = true;
            this._attack_lock = true;
            this.target_objects = this.parent_obj.get_dynamic_objs_in_section(
                this.range,
                Vec2.X(this.parent_obj.x_direction),
                this.angle,
                this.range_offset
            );
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
                    if (this.target_objects.closest) {
                        this.on_hit({
                            all: [this.target_objects.closest],
                            closest: this.target_objects.closest,
                        });
                    }
                } else {
                    this.on_hit(this.target_objects);
                    this.target_objects =
                        this.parent_obj.get_dynamic_objs_in_section(
                            this.range,
                            Vec2.X(this.parent_obj.x_direction),
                            this.angle,
                            this.range_offset
                        );
                }
            }
        }

        this.weapon_logic();
        this.set_animation();
        this.pressed = false;
    }

    weapon_logic() {}
    set_animation() {}
    on_hit(objs: {
        all: DynamicGameObj[];
        closest: DynamicGameObj | undefined;
    }) {
        objs.all.forEach((obj) => {
            (obj as Pisti).hit(
                this.power + this.crit,
                obj.hitboxes[0].middle
                    .sub(this.parent_obj.hitboxes[0].middle)
                    .normalize()
            );
        });
    }
}

export class Ranged extends Weapon {
    constructor(obj: DynamicGameObj, power: number) {
        super(obj, power, 500, Math.PI / 3);
        this.attack_delay = 800;
        this.cast_time = 1000;
    }

    set_animation(): void {
        if (this.attacking) {
            this.parent_obj.frame_time = 40;
            this.parent_obj.sprite_index = 6;
            this.parent_obj.halt_points = [
                { frame: 3, time: 200 },
                { frame: 8, time: 300 },
                { frame: 9, time: 100 },
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
                Vec2.X(5 * 6 * this.parent_obj.x_direction)
            );
        }
    }

    weapon_logic(): void {}

    on_hit(objs: {
        all: DynamicGameObj[];
        closest: DynamicGameObj | undefined;
    }): void {
        this.can_attack = false;
        super.on_hit(objs);
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
                false
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
                this.crit = 20;
            }
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
