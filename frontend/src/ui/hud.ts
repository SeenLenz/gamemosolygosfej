import { camera } from "../app";
import { Empty } from "../application/base/gameobject";
import { interpolate } from "../lin_alg";

export class Hud {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    healthRect: { x: number; y: number; width: number; height: number };
    potionRect: { x: number; y: number; width: number; height: number };
    healthUnit: number;
    potionUnit: number;
    healthBar: any;
    healthBarMask: any;

    constructor() {
        const body = document.body;
        const mainCanvas = document.querySelector("body canvas:nth-of-type(1)");
        this.canvas = (<HTMLCanvasElement>(
            document.createElement("canvas")
        )) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.healthRect = { x: 0, y: 5, width: 51, height: 18 };
        this.potionRect = { x: 25, y: 20, width: 4, height: 9 };
        this.healthUnit = 4;
        this.potionUnit = 1;
        this.canvas.className = "ui_canvas";
        this.canvas.id = "hud_canvas";
        this.healthBar = new Image();
        this.healthBar.src = "./textures/hud/HealthBar-finished.png";
        this.healthBarMask = new Image();
        this.healthBarMask.src = "./textures/hud/HealthBar-maskVer2.png";

        body?.insertBefore(this.canvas, mainCanvas);
    }

    setHealth(target: number) {
        this.healthRect.width =
            this.healthRect.width - (this.healthRect.width / 900) * target;
        //     if (this.healthRect.width > 19) {
        //         this.healthRect.width -= interpolate(
        //             this.healthRect.width,
        //             target,
        //             0.1
        //         );
        //     }
    }

    run() {
        clearHud(this.ctx, this.canvas);

        this.ctx.drawImage(
            this.healthBarMask,
            0,
            5,
            this.healthBarMask.width,
            this.healthBarMask.height
        );
        this.ctx.globalCompositeOperation = "source-in";

        this.ctx.fillStyle = "rgba(102, 0, 0, 255)";
        this.ctx.fillRect(
            this.healthRect.x,
            this.healthRect.y,
            this.healthRect.width,
            this.healthRect.height
        );

        this.ctx.globalCompositeOperation = "source-over";

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(
            this.healthBar,
            0,
            this.healthRect.y,
            this.healthBar.width,
            this.healthBar.height
        );

        this.ctx.globalCompositeOperation = "source-over";
    }
    openShop() {
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(75, 50, 50, 20);
    }

    closeShop() {}
}

export function clearHud(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
