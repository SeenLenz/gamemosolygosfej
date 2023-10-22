import { renderer } from "./app.js";

export class Camera {
    constructor() {
        this.pos = {
            x: 0,
            y: 0,
        };

        this.scale = 0.5;
    }

    convert() {
        return [this.pos.x, this.pos.y, this.scale];
    }
}