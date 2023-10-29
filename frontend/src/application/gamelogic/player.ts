import { camera, event, gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { EventType, Keys } from "../base/event_handler";
import { CollisionDir, DynamicGameObj, ObjectTag } from "../base/gameobject";

export class Player extends DynamicGameObj {
    public focused: boolean = false;
    constructor() {
        super(new Vec2(100, 100), new Vec2(camera.zero.x + camera.width / 2, camera.zero.y + camera.height/2));
        this.object_tag = ObjectTag.Player;
        this.mass = 1;
        this.reactive = true;
    }

    run(delta_time: number): void {
        super.collision(delta_time);
        super.run(delta_time);
        this.add_force(new Vec2(0, gravity * this.mass));
        
        this.keyboard_movement();

        super.motion(delta_time);
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

        if (!this.collision_dir(CollisionDir.Bottom)) {
            return;
        }

        if (event.key_state(Keys.W, EventType.Down)) {
            this.velocity.y = -20;
        }
    }
}
