import { eventHandler, gravity, renderer } from "./app.js";
import { DynamicGameObj, StaticGameObj } from "./gameobject.js";

export class Player extends DynamicGameObj {
    constructor() {
        super(renderer, [150, 150], [800, 400], [1, 0.2, 1], 5);
        this.velocity.x = -1;
    }
    
    run(delta_time) {
        super.run(delta_time);
        this.acceleration.y = gravity;
    }
}

export class Box extends StaticGameObj {
    constructor(position) {
        super(renderer, [200, 200], position, [1, 0.2, 1], 5);
    }
}

export class Enemy extends DynamicGameObj {
    constructor(position) {
        super(renderer, [100, 100], position, [1, 0., 0], 5);
        this.velocity.x = -1;
    }
    
    run(delta_time) {
        super.run(delta_time);
        this.acceleration.y = gravity;
    }
}
