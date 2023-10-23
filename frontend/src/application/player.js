import { camera, eventHandler, gravity, renderer } from "./app.js";
import { DynamicGameObj, StaticGameObj } from "./gameobject.js";

let score = document.querySelector(".score");

export class Player extends DynamicGameObj {
    constructor() {
        super(renderer, [100, 100], [0, 0], [1, 0.2, 1], 5);
        this.reactive = true;
        this.mass = 10;
        this.velocity.x = 5;
        this.force.x = 0.08;
        this.alive = true;
        this.object_tag = 0;
    }
    
    run(delta_time) {
        super.motion();
        super.collision();
        this.force.y = gravity * this.mass;

        if (eventHandler.keys.w) {
            this.force.y = -8;
        }

        if (!this.alive) {
            this.force.y = gravity * this.mass;
            this.force.x = 0;



            if (this.velocity.x > 0) {
                this.velocity.x *= -1;
            }
            else {
                this.velocity.x *= 0.9;
            }
        }

        if (this.alive) {
            score.innerText = Math.floor(performance.now() / 100);
        }

        camera.focus_on(this);
    }

    on_collision(collision) {
        super.on_collision(collision);

        if (collision.obj.object_tag == 1) {
            if (!score.classList.contains("final")){
                score.classList.add("final");
            }
            this.alive = false;
        }
    }
}

export class Box extends StaticGameObj {
    constructor(size, position) {
        super(renderer, size, position, [1, 0.2, 1], 1);
        this.object_tag = 1;
    }

    run() {
        if (this.object.transform.pos.x + this.object.dimensions.x < camera.zero.x) {
            this.object.transform.pos.x = camera.zero.x + camera.width; 
            this.object.transform.pos.y = Math.random() * (500) - 500; 
        }
    }
}


export class Border extends StaticGameObj {
    constructor(size, position) {
        super(renderer, size, position, [1, 0.2, 0.], 5);
    }

    run() {
        this.object.transform.pos.x = camera.zero.x;
    }
}
