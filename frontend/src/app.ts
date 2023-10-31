import { Renderer } from "./renderer/renderer";
import {
  EventHandler,
  EventType,
  Keys,
} from "./application/base/event_handler";
import { GameObject } from "./application/base/gameobject";
import { Camera } from "./application/base/camera";
import { Vec2 } from "./lin_alg";
import { Terrain } from "./application/gamelogic/terrain";
import { Player } from "./application/gamelogic/player";
import Enemy from "./application/gamelogic/enemy";

document.addEventListener("DOMContentLoaded", () => {
  main();
});

export const renderer = new Renderer();
export const event = new EventHandler(renderer);
export let camera = new Camera();
export let gravity = 0.8;

let start = 1;
let player: Player;
const Pali = new Worker("./webworker/worker.ts");

function setup() {
  renderer.setup();

  player = new Player();
  new Enemy(
    new Vec2(camera.width, camera.height).add(camera.zero).div(new Vec2(2, 2)),
    player
  );
  new Terrain(new Vec2(20, camera.height), camera.zero);
  new Terrain(new Vec2(camera.width, 20), camera.zero);
  new Terrain(
    new Vec2(camera.width, 20),
    camera.zero.add(new Vec2(0, camera.height - 20))
  );
  new Terrain(
    new Vec2(20, camera.height),
    camera.zero.add(new Vec2(camera.width - 20, 0))
  );
}

function main_loop() {
  const delta_time = (performance.now() - start) / 10;
  start = performance.now();
  renderer.run(camera.convert());
  camera.focus_on(player);

  GameObject.objects.forEach((go) => {
    go.run(delta_time);
    go.render();
  });

  event.refresh();
  requestAnimationFrame(main_loop);
}

function main() {
  setup();

  main_loop();
}
