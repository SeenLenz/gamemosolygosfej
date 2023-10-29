import { eventHandler as event, gravity, renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { EventType, Keys } from "../base/event_handler";
import { DynamicGameObj, ObjectTag } from "../base/gameobject";

export class Player extends DynamicGameObj {
    constructor() {
        super(new Vec2(200, 100), new Vec2(200, 100));
        this.object_tag = ObjectTag.Player;
        this.mass = 1;
    }

    run(delta_time: number): void {
        super.run(delta_time);
        this.add_force(new Vec2(0, gravity * this.mass));
        super.motion(delta_time);
        super.collision(delta_time);

        if (event.key_state(Keys.A, EventType.Released)) {
            this.velocity.x = -2;
        }
        else {
            this.velocity.x = 0;
        }
    }
}
