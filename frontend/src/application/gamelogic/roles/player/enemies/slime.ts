import { Networkable, Type } from "../../../../../../../types";
import { NetworkBuff, network } from "../../../../../app";
import { Vec2 } from "../../../../../lin_alg";
import { WorkerMsg } from "../../../../../networking/WorkerMsg";
import {
    DynamicGameObj,
    ObjectTag,
    StaticCollisionObj,
} from "../../../../base/gameobject";
import { Point, float_eq } from "../../../../base/rays";
import { SpriteSheets } from "../../../../base/textures";
import { BelaIsland } from "../../../map/map";
import { Enemy } from "../enemy";
import { v4 as uuid } from "uuid";

export class Bela extends Enemy implements Networkable {
    player_rec = false;
    grounded_timer = performance.now();
    attack_timer = performance.now();
    back = false;
    damage = 10;
    closest_player: DynamicGameObj | undefined;
    constructor(pos: Point, remote: boolean, remote_id: String | undefined) {
        super(pos);
        this.texture_index = SpriteSheets.SlimeEnemy;
        this.sprite_index = 0;
        this.main_hitbox.size.div_self(Vec2.uniform(2));
        this.main_hitbox.pos_diff.set(this.size.x / 4, this.size.y / 2);
        this.frame_time = 100;
        this.animation_repeat = false;
        this.hp = 200;
        this.closest_player = this.get_closest_player();
        this.remote = remote;
        if (!this.remote) {
            this.remote_id = uuid();
            network.outBuff_add(
                new WorkerMsg(Type.crt, {
                    type: ObjectTag.Bela,
                    pos: this.pos,
                    remote_id: this.remote_id,
                })
            );
            NetworkBuff.set(this.remote_id, this);
        } else {
            this.remote_id = remote_id as String;
            this.out = () => {};
        }
    }

    run(delta_time: number): void {
        this.closest_player = this.get_closest_player();
        this.attacked = false;
        if (performance.now() - this.dam_anim_timer > 70 * 10) {
            this.damagable = true;
        }

        this.movement();
        this.out();
        this.network_sync = false;
        super.run(delta_time);
    }

    damage_player() {
        if (this.damagable && this.closest_player) {
            this.closest_player.damage_taken(
                this.damage,
                this.x_direction,
                this
            );
        }
    }

    in(data: any): void {
        this.pos = Vec2.from(data.pos);
        this.velocity = Vec2.from(data.velocity);
        this.remote_id = data.remote_id;
        this.back = data.back;
        this.sprite_index = data.sprite_index;
        this.closest_player = NetworkBuff.get(data.closest_player) as any as
            | DynamicGameObj
            | undefined;
    }

    out(): void {
        if (this.network_sync) {
            network.outBuff_add(
                new WorkerMsg(Type.sync, {
                    pos: this.pos,
                    velocity: this.velocity,
                    remote_id: this.remote_id,
                    back: this.back,
                    closest_player: this.closest_player?.remote_id,
                    sprite_index: this.sprite_index,
                })
            );
        }
    }

    del(): void {
        NetworkBuff.delete(this.remote_id);
        this.remove();
    }

    on_death(): void {
        this.del();
        network.outBuff_add(
            new WorkerMsg(Type.sync, {
                death: true,
                remote_id: this.remote_id,
            })
        );
        // if (!this.remote) {
        //     let belacska1 = new Belacska(
        //         this.pos.sub(Vec2.X(-30)),
        //         false,
        //         undefined
        //     );
        //     belacska1.velocity.y = -3;
        //     belacska1.velocity.x = -10;
        //     let belacska2 = new Belacska(
        //         this.pos.sub(Vec2.X(30)),
        //         false,
        //         undefined
        //     );
        //     belacska2.velocity.y = -3;
        //     belacska2.velocity.x = 10;
        // }
    }

    attack(dist: number) {
        if (!this.can_attack && dist < 200 * 200) {
            this.can_attack = true;
        }

        if (!this.attacking && this.can_attack && dist < 40 * 40) {
            this.velocity.x *= -1;
            this.velocity.y *= -1;
            this.attacking = true;
            this.attacked = true;
            this.can_attack = false;
            this.attack_timer = performance.now();
            this.damage_player();
            this.network_sync = true;
            return;
        }

        if (performance.now() - this.attack_timer > 1000) {
            this.attacking = false;
            this.can_attack = false;
        }
    }

    movement() {
        if (!this.closest_player) {
            return;
        }
        this.back = false;
        const dist = this.closest_player.hitboxes[0].middle.dist_squared(
            this.main_hitbox.middle
        );
        if (dist < 80 * 80) {
            this.back = true;
        }
        this.attack(dist);
        this.detect_player(dist);
        if (!this.attacking) {
            if (
                this.player_rec &&
                this.grounded &&
                performance.now() - this.grounded_timer > 800
            ) {
                this.velocity.y = -11;
                this.grounded_timer = performance.now();
                this.follow_player();
            }
        }
    }

    on_velocity_changed(): void {
        this.network_sync = true;
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

    damage_taken(damage: number, hit_dir: number): void {
        if (this.damagable) {
            this.dam_anim_timer = performance.now();
            this.velocity.x += (damage / 4) * hit_dir;
            this.velocity.y += -2;
            this.grounded_timer = performance.now();
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

    detect_player(dist: number) {
        if ((!this.player_rec && dist > 300 * 300) || this.player_rec) {
            return;
        }

        if (!this.damagable) {
            this.player_rec = true;
        }

        this.player_rec = true;
    }

    follow_player() {
        if (!this.closest_player) {
            return;
        }
        const follow_dir_x = this.closest_player.hitboxes[0].middle
            .sub(this.main_hitbox.middle)
            .X.normalize().x;

        if (this.damagable && this.grounded) {
            if (this.back) {
                this.velocity.x = -3 * follow_dir_x;
            } else {
                this.velocity.x = 5 * follow_dir_x;
            }
        }
    }

    on_collision_y(obj: StaticCollisionObj): void {
        super.on_collision_y(obj);
        if (obj.obj.object_tag == ObjectTag.BelaIsland) {
            (obj.obj as BelaIsland).slime_on = true;
        }
    }
}

export class Belacska extends Bela implements Networkable {
    constructor(pos: Point, remote: boolean, remote_id: String | undefined) {
        super(pos, false, undefined);
        this.damage = 5;
        this.hp = 20;
        this.texture_index = SpriteSheets.SmallSlimeEnemy;
        this.remote = remote;
        if (!this.remote) {
            this.remote_id = uuid();
            network.outBuff_add(
                new WorkerMsg(Type.crt, {
                    type: ObjectTag.Belacska,
                    pos: this.pos,
                    remote_id: this.remote_id,
                })
            );

            NetworkBuff.set(this.remote_id, this);
        } else {
            this.remote_id = remote_id as String;
            this.out = () => {};
        }
    }

    on_death(): void {
        this.del();
        network.outBuff_add(
            new WorkerMsg(Type.sync, {
                death: true,
                remote_id: this.remote_id,
            })
        );
    }
}
