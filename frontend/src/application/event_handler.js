export class EventHandler {
    constructor() {
        this.mouse = {
            x: 0,
            y: 0,
        };

        window.addEventListener("mousemove", (ev) => {
            this.mouse.x = ev.x;
            this.mouse.y = ev.y;
        });
    }
}
 