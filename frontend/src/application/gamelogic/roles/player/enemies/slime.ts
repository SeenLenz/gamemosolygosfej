import { delta_time } from "../../../../../app";
import { Vec2, interpolate } from "../../../../../lin_alg";
import { CollisionDir, DynamicGameObj, StaticCollisionObj } from "../../../../base/gameobject";
import { Point, float_eq } from "../../../../base/rays";
import { SpriteSheets } from "../../../../base/textures";
import { player } from "../../role";
import { Enemy } from "../enemy";


export class Slime extends Enemy {
    player_rec = false;
    grounded_timer = 0;
    attack_timer = 0;
    back = false;
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
        this.attacked = false;
        if (performance.now() - this.dam_anim_timer > 70 * 10) {
            this.damagable = true;
        }

        this.movement();
        super.run(delta_time);
    }


    damage_player(dist: number) {
        if (!this.attacked && dist < 40 * 40) {
            this.velocity.x *= -1;
            this.velocity.y *= -1;
            this.attack_timer = performance.now();
            this.attacked = true;
        }
    }

    attack(dist: number) {
        if (this.grounded && !this.attacking && dist < 200 * 200) {
            this.attacking = true;
        }

        if (this.attacking) {
            this.damage_player(dist);
        }

        if (performance.now() - this.attack_timer > 100) {
            this.attacked = false;
            this.attacking = false;
        }
    }

    movement() {
        this.back = false;
        const dist = player.hitbox.middle.dist_squared(this.main_hitbox.middle);
        if (dist < 100 * 100) {
            this.back = true;
        }
        this.attack(dist);
        if (!this.attacking) {
            if (
                this.player_rec &&
                this.grounded &&
                performance.now() - this.grounded_timer > 800
            ) {
                this.velocity.y = -8;
                this.grounded_timer = performance.now();
                this.follow_player(dist);
            }
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
            this.attacking = false;
            this.attacked = false;
        }
    }

    follow_player(dist: number) {
        if (
            !this.player_rec &&
            dist >
            300 * 300
        ) {
            return;
        }

        this.player_rec = true;

        const follow_dir_x = player.hitbox.middle
            .sub(this.main_hitbox.middle)
            .X.normalize().x;

        if (this.damagable && this.grounded) {
            if (this.back) {
                this.velocity.x = -3 * follow_dir_x;
            }
            else {
                this.velocity.x = 5 * follow_dir_x;
            }
        }
    }

    on_collision_y(obj: StaticCollisionObj): void {
        super.on_collision_y(obj);
    }
}
