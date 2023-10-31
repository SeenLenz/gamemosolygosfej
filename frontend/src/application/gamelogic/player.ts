import { camera, event, gravity } from "../../app";
import { Vec2, Vec3 } from "../../lin_alg";
import { EventType, Keys } from "../base/event_handler";
import { CollisionDir, DynamicGameObj } from "../base/gameobject";

export class Player extends DynamicGameObj {
  doublejump: boolean;
  constructor() {
    super(
      new Vec2(100, 100),
      new Vec2(camera.width, camera.height).add(camera.zero).div(new Vec2(2, 2))
    );
    this.doublejump = true;
    this.color = new Vec3(0, 255, 0);
    this.mass = 1;
    this.reactive = true;
  }

  run(delta_time: number) {
    super.run(delta_time);
    super.collision(delta_time);

    super.motion(delta_time);
    this.moveplayer();

    this.add_force(new Vec2(0, gravity * this.mass));
  }

  moveplayer() {
    if (event.key_state(Keys.A, EventType.Down)) {
      this.velocity.x = -5;
    }
    if (event.key_state(Keys.D, EventType.Down)) {
      this.velocity.x = 5;
    }
    if (event.key_state(Keys.W, EventType.Down)) {
      this.velocity.y = -20;
    }
  }
}
