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
    constructor(pos: Point) {
        super(pos);
        this.ranged_weapon = new Ranged(this, 20, 200);
        this.texture_index = SpriteSheets.RangedEnemy;
        this.sprite_index = 1;
    }

    run(delta_time: number): void {
        super.run(delta_time);
        if (performance.now() - this.dam_anim_timer > 70 * 10) {
            this.damagable = true;
        }
        this.ranged_weapon.run();
        this.movement();
    }

    movement() {
        this.back = false;
        let dist = player.hitbox.middle.dist_squared(this.main_hitbox.middle);
        if (
            dist <
            (this.ranged_weapon.range - 100) * (this.ranged_weapon.range - 100)
        ) {
            this.back = true;
        }
        this.detect_player(dist);
        this.follow_player(dist);
    }

    detect_player(dist: number) {
        if (
            (!this.player_rec &&
                dist >=
                    (this.ranged_weapon.range - 100) *
                        (this.ranged_weapon.range - 100)) ||
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

        if (this.damagable && this.grounded) {
            if (this.back) {
                this.velocity.x = -3 * follow_dir_x;
            } else if (
                dist <
                (this.ranged_weapon.range - 100) *
                    (this.ranged_weapon.range - 100)
            ) {
            }
        }
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

        if (!this.grounded) {
            this.grounded_effect = false;
            this.ranged_weapon.attacking = false;
        }

        this.frame_time = 0;
        this.sprite_index = 1;

        if (!this.grounded && Math.abs(this.velocity.x) > 1) {
            this.frame_time = (1 / Math.abs(this.velocity.y)) * 400;
            this.sprite_index = 2;
            return;
        }
        if (Math.abs(this.velocity.x) > 0) {
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
}
