import { event } from "../../../app";
import { Vec2 } from "../../../lin_alg";
import { EventType, Keys } from "../../base/event_handler";
import { Empty } from "../../base/gameobject"

export class CameraObj extends Empty {
    constructor() {
        super(new Vec2(0, 0));
    }

    loop(delta_time: number): void {
        if (event.key_state(Keys.W, EventType.Down)) {
            this.pos.y += 10 * delta_time;
        }
        if (event.key_state(Keys.S, EventType.Down)) {
            this.pos.y += -10 * delta_time;
        }
        if (event.key_state(Keys.A, EventType.Down)) {
            this.pos.x += 10 * delta_time;
        }
        if (event.key_state(Keys.S, EventType.Down)) {
            this.pos.x += -10 * delta_time;
        }
    }
}