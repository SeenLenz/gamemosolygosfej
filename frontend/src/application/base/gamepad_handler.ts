export enum GamepadButtons {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    Up = 12,
    Down = 13,
    Left = 14,
    Right = 15,
    LB = 4,
    RB = 5,
    LT = 6,
    RT = 7,
}

export class GamepadEvent {
    constructor() {}

    isPressed(button: GamepadButtons): boolean | undefined {
        for (const controller in navigator.getGamepads()) {
            if (controller) {
                return navigator.getGamepads()[1]?.buttons[button].pressed;
            } else {
                return false;
            }
        }
    }
}
