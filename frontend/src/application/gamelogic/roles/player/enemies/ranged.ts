import { Vec2 } from "../../../../../lin_alg";
import { Effect, PlayerEffects } from "../../../../base/effects";
import { Point, float_eq } from "../../../../base/rays";
import { SpriteSheets } from "../../../../base/textures";
import { Ranged } from "../../../weapon/weapon";
import { player } from "../../role";
import { Enemy } from "../enemy";

export class Huba extends Enemy {
    grounded_effect: boolean = false;
    ranged_weapon: Ranged;
    back = false;
    player_rec = false;
    hp = 100;
    idle_timer = performance.now();
    constructor(pos: Point) {
        super(pos);
        this.ranged_weapon = new Ranged(this, 20, 500);
        this.texture_index = SpriteSheets.Huba;
        this.sprite_index = 1;
    }

    clear() {
        this.back = false;
        this.halt_points = [];
    }

    run(delta_time: number): void {
        this.clear();
        if (performance.now() - this.dam_anim_timer > 70 * 10) {
            this.damagable = true;
        }
        this.set_animations(delta_time);
        this.ranged_weapon.run();
        this.movement();
        super.run(delta_time);
    }

    movement() {
        let dist = player.hitbox.middle.dist_squared(this.main_hitbox.middle);
        if (
            dist <
            (this.ranged_weapon.range - 200) * (this.ranged_weapon.range - 200)
        ) {
            this.back = true;
        }
        this.detect_player(dist);
        this.follow_player(dist);

        if (Math.abs(this.velocity.x) > 0.4) {
            this.idle_timer = performance.now();
        } else if (performance.now() - this.idle_timer > 400) {
            if (!this.ranged_weapon.attacking) {
                this.ranged_weapon.pressed = true;
            }
        }
    }

    detect_player(dist: number) {
        if (
            (!this.player_rec &&
                dist >= this.ranged_weapon.range * this.ranged_weapon.range) ||
            this.player_rec
        ) {
            return;
        }

        if (!this.damagable) {
            this.player_rec = true;
        }

        this.player_rec = true;
    }

    follow_player(dist: number) {
        const follow_dir_x = player.hitbox.middle
            .sub(this.main_hitbox.middle)
            .X.normalize().x;

        this.x_direction = follow_dir_x;

        if (this.damagable && this.grounded) {
            if (this.back) {
                this.velocity.x = -4 * follow_dir_x;
                this.x_direction = -follow_dir_x;
            } else if (
                dist >
                (this.ranged_weapon.range - 20) *
                    (this.ranged_weapon.range - 20)
            ) {
                this.velocity.x = 4 * follow_dir_x;
            }
        }
    }

    damage_taken(damage: number, hit_dir: number): void {
        if (this.damagable) {
            this.dam_anim_timer = performance.now();
            this.velocity.x += 5 * hit_dir;
            this.velocity.y += -2;
            this.idle_timer = performance.now();
            this.hp -= damage;
            this.frame_time = 70;
            this.sprite_index = 5;
            this.player_rec = true;
            this.damagable = false;
            this.can_attack = false;
            this.attacking = false;

            if (this.hp < 0) {
                this.on_death();
            }
        }
    }

    on_death(): void {
        this.ranged_weapon.projectile = undefined;
        this.remove();
    }

    set_animations(delta_time: number) {
        if (this.ground_hit) {
            new Effect(
                Vec2.from(this.size),
                Vec2.from(this.pos),
                this.x_direction,
                SpriteSheets.PlayerEffects,
                PlayerEffects.Grounded,
                100,
                0
            );
        }

        this.sprite_index = 1;
        if (!this.grounded) {
            this.grounded_effect = false;
            this.ranged_weapon.attacking = false;
        }

        if (!this.grounded && Math.abs(this.velocity.x) > 1) {
            this.frame_time = (1 / Math.abs(this.velocity.y)) * 400;
            this.sprite_index = 2;
            return;
        }
        if (!float_eq(this.velocity.y, 0) || Math.abs(this.velocity.x) > 3) {
            this.ranged_weapon.attacking = false;
            this.frame_time = (1 / Math.abs(this.velocity.x)) * 250;
            this.sprite_index = 0;
        }
    }
}
