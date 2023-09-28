import { Renderer } from "./renderer/renderer.js";

export class App {
  constructor() {
    this.renderer = new Renderer();
  }

  setup() {
    this.renderer.setup();
  }

  main_loop() {
    this.renderer.run();
  }
}
