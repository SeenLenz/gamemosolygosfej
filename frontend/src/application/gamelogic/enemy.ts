import { Vec2, Vec3 } from "../../lin_alg";
import { StaticGameObj } from "../base/gameobject";
import { event } from "../../app";
import { Player } from "./player";
import Projectile from "./projectile";
import { EventType, Keys } from "../base/event_handler";

export default class Enemy extends StaticGameObj {
  enemy: Player;
  constructor(position: Vec2, enemy: Player) {
    super(new Vec2(100, 100), position);
    this.collidable = false;
    this.isDynamic = false;
    this.color = new Vec3(255, 0, 0);
    this.enemy = enemy;
  }
  run(delta_time: number): void {
    if (event.key_state(Keys.A, EventType.Pressed)) {
      new Projectile(this.pos, this.enemy.pos);
      console.log("asdf");
    }
  }
}
