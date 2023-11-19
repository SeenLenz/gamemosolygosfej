import { delta_time } from "../../../../../app";
import { Vec2, interpolate } from "../../../../../lin_alg";
import { CollisionDir, StaticCollisionObj } from "../../../../base/gameobject";
import { Point, float_eq } from "../../../../base/rays";
import { SpriteSheets } from "../../../../base/textures";
import { player } from "../../role";
import { Enemy } from "../enemy";

export class Slime extends Enemy {
    player_rec = false;
    grounded_timer = 0;
    constructor(pos: Point) {
        super(pos);
        this.texture_index = SpriteSheets.SlimeEnemy;
        this.sprite_index = 0;
        this.main_hitbox.size.div_self(Vec2.uniform(2));
        this.main_hitbox.pos_diff.set(this.size.x / 4, this.size.y / 2);
        this.frame_time = 100;
        this.animation_repeat = false;
    }

    run(delta_time: number): void {
        if (performance.now() - this.dam_anim_timer > 70 * 10) {
            this.damagable = true;
        }

        this.movement();
        super.run(delta_time);
    }

    movement() {
        this.follow_player();
        if (
            this.player_rec &&
            this.grounded &&
            performance.now() - this.grounded_timer > 1000
        ) {
            this.velocity.y = -10;
            this.grounded_timer = performance.now();
        }
    }

    set_animation(): void {
        if (this.velocity.x < 0) {
            this.x_direction = -1;
        } else {
            this.x_direction = 1;
        }

        if (this.damagable) {
            this.frame_time = 100;
            if (this.ground_hit) {
                this.sprite_index = 4;
            } else if (this.grounded && this.animation_ended) {
                this.sprite_index = 0;
            }

            if (!this.grounded) {
                if (float_eq(this.velocity.y, 0)) {
                    this.sprite_index = 2;
                } else if (this.velocity.y < 0) {
                    this.sprite_index = 1;
                } else if (this.velocity.y > 0) {
                    this.sprite_index = 3;
                }
            }
        }
    }

    hit(damage: number, dir: Vec2): void {
        if (this.damagable) {
            this.dam_anim_timer = performance.now();
            this.velocity.x += (damage / 4) * dir.x;
            this.velocity.y += -2;
            this.grounded_timer = performance.now();
            this.hp -= damage;
            this.frame_time = 70;
            this.sprite_index = 5;
            // if (this.hp < 0) {
            //     this.remove();
            // }
            this.player_rec = true;
            this.damagable = false;
        }
    }

    follow_player() {
        if (
            !this.player_rec &&
            player.hitbox.middle.dist_squared(this.main_hitbox.middle) >
                300 * 300
        ) {
            return;
        }

        this.player_rec = true;

        const follow_dir_x = player.hitbox.middle
            .sub(this.main_hitbox.middle)
            .X.normalize().x;

        if (this.damagable && this.grounded) {
            this.velocity.x = 2 * follow_dir_x;
        }
    }

    on_collision_y(obj: StaticCollisionObj): void {
        super.on_collision_y(obj);
    }
}
