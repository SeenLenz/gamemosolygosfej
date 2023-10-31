import { camera, event, gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { EventType, Keys } from "../base/event_handler";
import { CollisionDir, DynamicGameObj, GameObject, Hitbox, ObjectTag } from "../base/gameobject";

export class Player extends DynamicGameObj {
    public focused: boolean = false;
    constructor(size: number[], pos: number[]) {
        super(new Vec2(size[0], size[1]), new Vec2(pos[0], pos[1]));
        this.object_tag = ObjectTag.Player;
        // this.hitbox = new Hitbox(this.size.mul(new Vec2(2, 2)), this.pos.sub(this.size.div(new Vec2(4, 4))));
        // this.hb_pos_diff = new Vec2(-50, -50);
        this.mass = 1;
        this.reactive = true;
    }

    run(delta_time: number): void {
        super.collision(delta_time);
        super.motion(delta_time);
        super.run(delta_time);

        // this.object.render(renderer, this.hitbox.pos, this.hitbox.size);

        this.rotation = (this.rotation + 0.01 * delta_time)  % (3.141 * 2);

        let gravity_vec = new Vec2(0, gravity * this.mass);
        let rotated_gravity_vec = gravity_vec.rotate(camera.rotation);
        this.add_force(rotated_gravity_vec);

        // this.keyboard_movement();
    }


    keyboard_movement() {
        if (!this.focused) {
            this.velocity.x = 0;
            return;
        };

        if (event.key_state(Keys.A, EventType.Down)) {
            this.velocity.x = -5;
        }
        else if (event.key_state(Keys.D, EventType.Down)) {
            this.velocity.x = 5;
        }
        else {
            this.velocity.x = 0;
        }
    }
}
