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

    key_state(key: Keys, state: EventType): boolean {
        const current_state = this.keyboard_event.keys[key];
        if (state == EventType.Up) {
            return current_state == EventType.Up ||current_state == EventType.Released ||current_state == undefined;
        }
        if (state == EventType.Down) {
            return current_state == EventType.Down ||current_state == EventType.Pressed;
        }

        return current_state == state;
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
    F,
    Space,
}

class KeyboardEvent {
    keys: Array<EventType>;
    active_keys: Array<Keys>;
    current_event: EventType;

    constructor() {
        this.keys = new Array(255);
        this.active_keys = [];
        this.current_event = EventType.Pressed;

        console.log(this.keys[0]);

        window.addEventListener("keydown", (ev) => {
            this.current_event = EventType.Pressed;
            switch (ev.code) {
                case "KeyW":
                    this.setKBEvent(Keys.W);
                    break;
                case "KeyA":
                    this.setKBEvent(Keys.A);
                    break;
                case "KeyS":
                    this.setKBEvent(Keys.S);
                    break;
                case "KeyD":
                    this.setKBEvent(Keys.D);
                    break;
                case "Space":
                    this.setKBEvent(Keys.Space);
                    break;
                case "KeyF":
                    this.setKBEvent(Keys.F);
                    break;
            }
        });

        window.addEventListener("keyup", (ev) => {
            this.current_event = EventType.Released;
            switch (ev.code) {
                case "KeyW":
                    this.setKBEvent(Keys.W);
                    break;
                case "KeyA":
                    this.setKBEvent(Keys.A);
                    break;
                case "KeyS":
                    this.setKBEvent(Keys.S);
                    break;
                case "KeyD":
                    this.setKBEvent(Keys.D);
                    break;
                case "Space":
                    this.setKBEvent(Keys.Space);
                    break;
                case "KeyF":
                    this.setKBEvent(Keys.F);
                    break;
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

    setKBEvent(key: Keys) {
        if ((this.current_event == EventType.Pressed &&
            this.keys[key] != EventType.Down) || 
            (this.current_event == EventType.Released &&
            this.keys[key] != EventType.Up)) {

            this.keys[key] = this.current_event;
            this.active_keys.push(key);
        }
    }
}
