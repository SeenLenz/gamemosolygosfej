import { Networkable } from "../../../../../types";
import { Vec2 } from "../../../lin_alg";
import { Effect } from "../../base/effects";
import { DynamicFlag, DynamicGameObj, GameObject } from "../../base/gameobject";
import { SpriteSheets } from "../../base/textures";
import { Bela } from "../roles/player/enemies/slime";

export class MapObject extends DynamicGameObj {
    parent_obj: GameObject;
    realtive_pos: Vec2;
    constructor(scale: Vec2, position: Vec2, parent: GameObject) {
        super(scale, parent.pos.add(position));
        this.parent_obj = parent;
        this.realtive_pos = position;
    }

    loop(delta_time: number): void {
        this.pos = this.parent_obj.hitboxes[0].pos
            .add(this.realtive_pos)
            .sub(Vec2.Y(this.size.y));

        super.loop(delta_time);
    }
}

export class BelaTank extends MapObject {
    bela: Effect | undefined;
    constructor(parent: GameObject) {
        super(new Vec2(18 * 6, 36 * 6), Vec2.X(11 * 6), parent);
        this.texture_index = SpriteSheets.BelaTank;
        this.sprite_index = 0;
        this.animation_repeat = false;
        this.bela = new Effect(
            this.size,
            this.parent_obj.hitboxes[0].pos
                .add(this.realtive_pos)
                .sub(Vec2.Y(this.size.y)),
            this.x_direction,
            SpriteSheets.SwimmingBela,
            0,
            30,
            1,
            Vec2.zeros(),
            false,
            false,
            undefined,
            false,
            false
        );
        this.bela.current_frame = this.bela.sprite[1] - 1;
    }

    damage_taken(damage: number, hit_dir: number): void {
        if (this.sprite_index < 4 && this.bela) {
            this.sprite_index += 1;
            this.bela.current_cycle = 0;
            this.bela.x_direction = hit_dir;
        } else {
            this.add_flags([DynamicFlag.NotDamagable]);
            this.sprite_index = 5;
            this.bela = undefined;
            if (!this.remote) {
                new Bela(this.pos, false, undefined);
            }
        }
    }

    set_animation() {
        if (this.bela && this.bela.current_frame < 4) {
            this.bela.frame_time = 25;
        } else if (this.bela) {
            this.bela.frame_time = 100;
        }
    }

    loop(delta_time: number): void {
        this.animate(20);
        this.set_animation();
        if (this.bela && this.bela.current_cycle >= this.bela.repeat) {
            this.bela.current_frame = 0;
        }
        if (this.bela) {
            this.bela.animate();
        }
        super.loop(delta_time);
    }
}
