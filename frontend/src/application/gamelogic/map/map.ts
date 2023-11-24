import { Networkable, Type } from "../../../../../types";
import { NetworkBuff, gravity, network } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { WorkerMsg } from "../../../networking/WorkerMsg";
import { Effect } from "../../base/effects";
import {
    GameObject,
    Hitbox,
    HitboxFlags,
    ObjectTag,
    StaticGameObj,
} from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { BelaTank } from "./objects";
import { v4 as uuid } from "uuid";

export class Map_ {
    static background: GameObject[] = [];
    static objects: GameObject[] = [];
    static foreground: GameObject[] = [];
    constructor() {
        Map_.objects.push(new BaseIsland());
        if (network.outBuff.cid == 0) {
            Map_.objects.push(
                new BelaIsland(new Vec2(-100 * 6, 100 * 6), false, undefined)
            );
            Map_.objects.push(
                new BelaIsland(new Vec2(320 * 6, 100 * 6), false, undefined)
            );
        }
    }

    render(delta_time: number) {
        Map_.background.forEach((obj) => {
            obj.loop(delta_time);
            obj.render();
        });
        Map_.objects.forEach((obj) => {
            obj.loop(delta_time);
            obj.render();
        });
    }
}

export class BelaIsland extends StaticGameObj implements Networkable {
    bela_tank: BelaTank;
    bela_free = false;
    fall_timer = 0;
    fall_speed = 0;
    fake_fall = false;
    slime_on = false;
    remote = false;
    remote_id: String;
    constructor(pos: Vec2, remote: boolean, remote_id: String | undefined) {
        super(new Vec2(103 * 6, 80 * 6), pos, false, true);
        this.texture_index = SpriteSheets.SideIsland;
        this.hitboxes[0].size.y = 3 * 6;
        this.hitboxes[0].size.x = this.size.x - 2 * 6;
        this.hitboxes[0].pos_diff.x = 6;
        this.hitboxes[0].pos_diff.y = 41 * 6;
        this.hitboxes[0].pos = this.pos.add(this.hitboxes[0].pos_diff);
        this.object_tag = ObjectTag.BelaIsland;
        this.set_texture_coords(new Vec2(1, 1), new Vec2(0, 0));
        this.bela_tank = new BelaTank(this);
        if (remote) {
            this.remote = true;
            this.remote_id = remote_id as String;
        } else {
            this.remote = false;
            this.remote_id = uuid();
            network.send(
                new WorkerMsg(Type.map, {
                    type: ObjectTag.BelaIsland,
                    pos: this.pos,
                    remote_id: this.remote_id,
                })
            );

            NetworkBuff.set(this.remote_id, this);
        }
    }

    out(): void {
        if (this.network_sync) {
            network.outBuff_add(
                new WorkerMsg(Type.sync, {
                    tank_sprite_index: this.bela_tank.sprite_index,
                    remote_id: this.remote_id,
                    current_cycle: this.bela_tank.bela?.current_cycle,
                })
            );
        }
    }

    in(data: any): void {
        this.bela_tank.sprite_index = data.tank_sprite_index;
        if (this.bela_tank.bela) {
            this.bela_tank.bela.current_cycle = data.current_cycle;
        }
    }

    del(): void {}

    get obj_index() {
        return Map_.objects.findIndex((obj) => obj == this);
    }

    loop(delta_time: number) {
        if (this.slime_on) {
            this.fall_timer = performance.now();
        }
        if (!this.bela_free && this.bela_tank.sprite_index == 5) {
            this.fall_timer = performance.now();
            this.bela_free = true;
        }

        if (this.bela_free && performance.now() - this.fall_timer > 2000) {
            this.pos.y += this.fall_speed * delta_time;
            this.fall_speed += gravity * delta_time;

            if (!this.fake_fall && this.fall_speed > 20 * delta_time) {
                this.fall_speed = 0;
                this.fall_timer = performance.now() - 1000;
                this.fake_fall = true;
            }
        }

        if (this.pos.y > 5000) {
            GameObject.static_hitboxes.splice(this.hitbox_index, 1);
            Map_.objects.splice(this.obj_index, 1);
        }

        this.hitboxes[0].pos = this.pos.add(this.hitboxes[0].pos_diff);

        this.out();

        super.loop(delta_time);
        this.slime_on = false;
        this.network_sync = false;
    }
}

class BaseIsland extends StaticGameObj {
    constructor() {
        super(new Vec2(309 * 6, 240 * 6), Vec2.zeros(), false, true);
        this.texture_index = SpriteSheets.MainIsland;
        this.hitboxes[0].size.y = 3 * 6;
        this.hitboxes[0].size.x = 273 * 6 - 7 * 6;
        this.hitboxes[0].pos_diff.x = 7 * 6;
        this.hitboxes[0].pos_diff.y = 170 * 6;
        this.hitboxes[0].pos = this.pos.add(this.hitboxes[0].pos_diff);

        this.hitboxes.push(
            new Hitbox(
                new Vec2((280 - 233) * 6, 2 * 6),
                new Vec2(233 * 6, 123 * 6),
                true
            )
        );
        this.hitboxes[1].flags.push(HitboxFlags.Platform);

        this.hitboxes.push(
            new Hitbox(
                new Vec2((233 - 216) * 6, 3 * 6),
                new Vec2(216 * 6, 142 * 6),
                true
            )
        );
        this.hitboxes[2].flags.push(HitboxFlags.Platform);

        this.hitboxes.push(
            new Hitbox(new Vec2(6 * 6, 6 * 6), new Vec2(232 * 6, 125 * 6), true)
        );

        this.hitboxes.push(
            new Hitbox(
                new Vec2((182 - 89) * 6, (169 - 167) * 6),
                new Vec2(87 * 6, 167 * 6),
                true
            )
        );

        let tavern_balcony = new Hitbox(
            new Vec2((182 - 89) * 6, 2 * 6),
            new Vec2(87 * 6, 126 * 6),
            true
        );
        tavern_balcony.flags.push(HitboxFlags.Platform);
        this.hitboxes.push(tavern_balcony);

        let left_barrel_row_bottom = new Hitbox(
            new Vec2((69 - 37) * 6, 9 * 6),
            new Vec2(37 * 6, 158 * 6),
            true
        );

        left_barrel_row_bottom.flags.push(HitboxFlags.RunThrough);
        left_barrel_row_bottom.flags.push(HitboxFlags.Platform);
        this.hitboxes.push(left_barrel_row_bottom);

        let left_barrel_row_top = new Hitbox(
            new Vec2((203 - 183) * 6, 9 * 6),
            new Vec2((37 + 203 - 183) * 6, 149 * 6),
            true
        );

        left_barrel_row_top.flags.push(HitboxFlags.RunThrough);
        left_barrel_row_top.flags.push(HitboxFlags.Platform);
        this.hitboxes.push(left_barrel_row_top);

        let right_barrel_row = new Hitbox(
            new Vec2((203 - 183) * 6, 9 * 6),
            new Vec2(183 * 6, 157 * 6),
            true
        );

        right_barrel_row.flags.push(HitboxFlags.RunThrough);
        right_barrel_row.flags.push(HitboxFlags.Platform);
        this.hitboxes.push(right_barrel_row);

        new Effect(
            this.size,
            this.pos,
            1,
            SpriteSheets.MainIslandForeground,
            0,
            0,
            -1,
            Vec2.zeros(),
            false,
            false,
            undefined,
            false
        );

        this.set_texture_coords(new Vec2(1, 1), new Vec2(0, 0));
    }

    loop(delta_time: number) {
        super.loop(delta_time);
    }
}
