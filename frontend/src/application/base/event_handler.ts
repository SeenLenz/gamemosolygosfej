import { gravity } from "../../app";
import { Vec2 } from "../../lin_alg";
import { Renderer } from "../../renderer/renderer";

export enum EventType {
    Pressed,
    Released,
    Up,
    Down,   
}

export class EventHandler {
    keyboard_event: KeyboardEvent;
    mouse_event: MouseEvent;
    constructor(renderer: Renderer) {
        this.keyboard_event = new KeyboardEvent();
        this.mouse_event = new MouseEvent();
        window.addEventListener("resize", _ => {
            renderer.gl.canvas.width = renderer.canvas.clientWidth;
            renderer.gl.canvas.height = renderer.canvas.clientHeight;
    
            renderer.gl.viewport(0, 0, renderer.gl.canvas.width, renderer.gl.canvas.height);
        })
    }

    refresh() {
        this.keyboard_event.refresh();
    }
}

export enum Buttons {
    Left,
    Middle,
    Right,
}

class MouseEvent {
    buttons: Array<EventType>;
    movement: Vec2;
    pos: Vec2;
    constructor() {
        this.buttons = new Array(3);
        this.movement = new Vec2(0, 0);
        this.pos = new Vec2(0, 0);

        window.addEventListener("mousemove", (ev) => {
            let event = new Vec2(ev.x, ev.y);
            this.movement = event.sub(this.pos);
            this.pos = event;
        });
    }
}

export enum Keys {
    W,
    A,
    S,
    D,
}

class KeyboardEvent {
    keys: Array<EventType>;
    active_keys: Array<Keys>;

    constructor() {
        this.keys = new Array(255);
        this.active_keys = [];

        window.addEventListener("keypress", (ev) => {
            switch (ev.code) {
                case "KeyW":
                    this.keys[Keys.W] = EventType.Pressed;
                    this.active_keys.push(Keys.W);
                    break;
            }
            if (ev.code == "w") {
            }
            if (ev.code == "a") {
                this.keys[Keys.A] = EventType.Pressed;
                this.active_keys.push(Keys.A);
            }
            if (ev.code == "s") {
                this.keys[Keys.S] = EventType.Pressed;
                this.active_keys.push(Keys.S);
            }
            if (ev.code == "d") {
                this.keys[Keys.D] = EventType.Pressed;
                this.active_keys.push(Keys.D);
            }
        });

        window.addEventListener("keyup", (ev) => {
            if (ev.code == "w") {
                this.keys[Keys.W] = EventType.Released;
                this.active_keys.push(Keys.W);
            }
            if (ev.code == "a") {
                this.keys[Keys.A] = EventType.Released;
                this.active_keys.push(Keys.A);
            }
            if (ev.code == "s") {
                this.keys[Keys.S] = EventType.Released;
                this.active_keys.push(Keys.S);
            }
            if (ev.code == "d") {
                this.keys[Keys.D] = EventType.Released;
                this.active_keys.push(Keys.D);
            }
        });
    }

    refresh() {
        this.active_keys.forEach((key) => {
            switch (this.keys[key]) {
                case EventType.Pressed:
                    this.keys[key] = EventType.Down;
                    break;
                case EventType.Released:
                    this.keys[key] = EventType.Up;
                    break;
            }
        });

        this.active_keys = [];
    }
}

