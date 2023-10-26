import { camera, eventHandler, gravity, renderer } from "./app.js";
import { DynamicGameObj, StaticGameObj } from "./gameobject.js";

let score = document.querySelector(".score");

export class Box extends StaticGameObj {
    constructor() {
        super(renderer, [camera.width, 20], [camera.zero.x, camera.zero.y + camera.height - 100], [1., 0., 0], 1);
    }
}

export class Wall extends StaticGameObj {
    constructor() {
        super(renderer, [20, camera.height], [camera.zero.x, camera.zero.y], [1., 0., 0], 1);
    }
}

export class DBox extends DynamicGameObj {
    constructor() {
        super(renderer, [100, 100], [500, 100], [1, 1, 0])
        this.velocity.x = 1;
        this.mass = 1;
        this.force.y = gravity * this.mass;
        this.reactive = true;
    }

    run(delta_time) {
        super.motion(delta_time);
        super.collision();
    }
}

export class DBox2 extends DynamicGameObj {
    constructor() {
        super(renderer, [100, 100], [1000, 100], [0, 1, 0])
        this.velocity.x = -10;
        this.mass = 10;
        this.force.y = gravity * this.mass;
        this.reactive = true;
    }

    run(delta_time) {
        super.motion(delta_time);
        super.collision();
    }
}