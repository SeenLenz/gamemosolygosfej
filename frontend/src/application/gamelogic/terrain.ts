import { Vec2 } from "../../lin_alg";
import { StaticGameObj } from "../base/gameobject";

export class Terrain extends StaticGameObj {
  constructor(scale: Vec2, position: Vec2) {
    super(scale, position);
  }
}
