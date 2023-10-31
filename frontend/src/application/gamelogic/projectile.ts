import { Vec2, Vec3 } from "../../lin_alg";
import { DynamicGameObj } from "../base/gameobject";

enum ProjectileType {}

export default class Projectile extends DynamicGameObj {
  direction: Vec2;
  constructor(position: Vec2, targetpos: Vec2) {
    super(new Vec2(20, 20), position);
    this.color = new Vec3(0, 0, 255);
    this.direction = targetpos.sub(position).direction();
    this.reactive = false;
    this.collidable = false;
  }
  run(delta_time: number): void {
    this.velocity.set(2, 2);
    this.velocity.mul_self(this.direction);
    console.log(this.velocity);

    super.motion(delta_time);
  }
}
