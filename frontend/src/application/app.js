import { Renderer } from "../renderer/renderer.js";
import { Obj, quad } from "../renderer/object.js";
import { EventHandler } from "./event_handler.js";

export class App {
    constructor() {
        this.renderer = new Renderer();
        this.objects = [];
        this.event_handler = new EventHandler();
    }

    setup() {
        this.renderer.setup();
    
        const colors = [
            1, 1, 1,
            0.5, 1, 1,
            1, 0.1, 0.4,
            1, 1, 0,
            0, 1, 0.3,
            1, 0.3, 0.2
        ];

        const q = quad(1, 0.1);
        this.objects.push(new Obj(q.positions, q.indicies, colors, this.renderer));
        this.objects[0].transform = [0., -1, 1.];
    }

    main_loop() {
        this.renderer.run();
        
        this.objects[0].render(this.renderer);

        requestAnimationFrame(this.main_loop.bind(this))
    }
}
