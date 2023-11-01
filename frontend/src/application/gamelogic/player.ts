import { event, gravity } from "../../app";
import { Vec2 } from "../../lin_alg";
import { EventType, Keys } from "../base/event_handler";
import { CollisionDir, DynamicGameObj, GameObject, Hitbox, ObjectTag } from "../base/gameobject";

export class Player extends DynamicGameObj {
    public focused: boolean = false;
    frame: number = 0;
    start_time: number = 0;
    constructor(size: number[], pos: number[]) {
        super(new Vec2(size[0], size[1]), new Vec2(pos[0], pos[1]));
        this.object_tag = ObjectTag.Player;
        this.hitbox = new Hitbox(this.size.div(new Vec2(2, 1)), this.pos.sub(new Vec2(this.size.x / 4, 0)));
        this.hb_pos_diff = new Vec2(this.size.x / 4, 0);
        this.mass = 1;
        this.reactive = true;
        this.focused = true;
        this.texture_index = 0;
    }
    
    run(delta_time: number): void {
        this.set_texture_coords(new Vec2(0.25, 1), new Vec2(0.25 * this.frame, 0));
        super.collision(delta_time);
        super.motion(delta_time);
        super.run(delta_time);

        let gravity_vec = new Vec2(0, gravity * this.mass);
        this.add_force(gravity_vec);

        if (performance.now() - this.start_time > 300) {
            this.start_time = performance.now();
            this.frame += 1;
            if (this.frame > 3) {
                this.frame = 0;
            }
        }        

        this.keyboard_movement();
    }


    keyboard_movement() {
        if (!this.focused) {
            this.velocity.x = 0;
            return;
        };

        if (event.key_state(Keys.A, EventType.Down)) {
            this.velocity.x = -5;
            this.texture_flip = -1;
        }
        else if (event.key_state(Keys.D, EventType.Down)) {
            this.velocity.x = 5;
            this.texture_flip = 1;
        }
        else {
            this.velocity.x = 0;
        }

        if (!this.collision_dir(CollisionDir.Bottom)) {
            return;
        }

        if (event.key_state(Keys.W, EventType.Down)) {
            this.velocity.y = -20;
        }
    }
}
