import { Vec2 } from "../../../lin_alg";
import { Effect } from "../../base/effects";
import { DynamicGameObj } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { Pisti } from "../pisti";

export class Weapon {
    parent_obj: DynamicGameObj;
    animation_timer = 0;
    pressed = false;
    attacking = false;
    attacked = false;
    base_timer = 0;
    combo_count = 0;
    power: number;
    constructor(obj: DynamicGameObj, power: number) {
        this.parent_obj = obj;
        this.power = power;
    }
}

export class Pistol extends Weapon {
    constructor(obj: DynamicGameObj, power: number) {
        super(obj, power);
    }

    shoot() {
        if (this.pressed) {
            this.attacking = true;
            this.base_timer = performance.now();
            this.parent_obj.current_frame = 0;
            this.attacked = true;
        }
    }

    run() {
        this.shoot();
        this.pressed = false;
        if (this.attacking && performance.now() - this.base_timer > 1000) {
            this.attacking = false;
        } else if (
            this.attacking &&
            performance.now() - this.base_timer > 800
        ) {
            if (this.attacked) {
                const closest_obj = this.parent_obj.get_dynamic_objs_in_section(
                    300,
                    Vec2.X(this.parent_obj.x_direction),
                    Math.PI / 2
                );

                if (closest_obj.closest) {
                    (closest_obj.closest as Pisti).hit(
                        this.power,
                        this.parent_obj.x_direction
                    );
                }
                new Effect(
                    this.parent_obj.size,
                    this.parent_obj.pos,
                    this.parent_obj.x_direction,
                    SpriteSheets.Ranged,
                    0,
                    50,
                    0,
                    Vec2.X(5 * 6 * this.parent_obj.x_direction)
                );
                this.attacked = false;
            }
        }

        if (this.attacking) {
            this.parent_obj.frame_time = 40;
            this.parent_obj.sprite_index = 6;
            this.parent_obj.halt_points = [
                { frame: 3, time: 200 },
                { frame: 8, time: 300 },
                { frame: 9, time: 100 },
            ];
        }
    }
}
