import { Point } from "./application/base/rays";

export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static uniform(value: number) {
        return new Vec2(value, value);
    }

    static zeros() {
        return new Vec2(0, 0);
    }

    static from(vec2: Point) {
        return new Vec2(vec2.x, vec2.y);
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    set_vec(vec2: Point) {
        this.x = vec2.x;
        this.y = vec2.y;
    }

    add(vec2: Point) {
        let result = new Vec2(0, 0);
        result.x = this.x + vec2.x;
        result.y = this.y + vec2.y;
        return result;
    }

    add_self(vec2: Point) {
        this.x += vec2.x;
        this.y += vec2.y;
    }

    sub(vec2: Point) {
        let result = new Vec2(0, 0);
        result.x = this.x - vec2.x;
        result.y = this.y - vec2.y;
        return result;
    }

    sub_self(vec2: Point) {
        this.x -= vec2.x;
        this.y -= vec2.y;
    }

    mul(vec2: Point) {
        let result = new Vec2(0, 0);
        result.x = this.x * vec2.x;
        result.y = this.y * vec2.y;
        return result;
    }

    mul_self(vec2: Point) {
        this.x *= vec2.x;
        this.y *= vec2.y;
    }

    div(vec2: Point) {
        let result = new Vec2(0, 0);
        result.x = this.x / vec2.x;
        result.y = this.y / vec2.y;
        return result;
    }

    div_self(vec2: Point) {
        this.x /= vec2.x;
        this.y /= vec2.y;
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let result = new Vec2(0, 0);
        let magn = this.magnitude;
        result.x = this.x / magn;
        result.y = this.y / magn;
        return result;
    }

    rotate(angle: number) {
        let result = new Vec2(0, 0);
        let rotation_vec = [Math.sin(angle), Math.cos(angle)];
        result.y = this.y * rotation_vec[1] - this.x * rotation_vec[0];
        result.x = this.x * rotation_vec[1] + this.y * rotation_vec[0];
        return result;
    }

    as_raw() {
        return new Float32Array([this.x, this.y]);
    }

    interpolate(target: Vec2, speed: Point) {
        return target.sub(this).mul(speed);
    }

    dist_squared(point: Point) {
        let distx = this.x - point.x;
        let disty = this.y - point.y;
        return distx * distx + disty * disty;
    }
}

export class Vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vec3: Vec3) {
        let result = new Vec3(0, 0, 0);
        result.x = this.x + vec3.x;
        result.y = this.y + vec3.y;
        result.z = this.z + vec3.z;
        return result;
    }

    add_self(vec3: Vec3) {
        this.x += vec3.x;
        this.y += vec3.y;
        this.z += vec3.z;
    }

    sub(vec3: Vec3) {
        let result = new Vec3(0, 0, 0);
        result.x = this.x - vec3.x;
        result.y = this.y - vec3.y;
        result.z = this.z - vec3.z;
        return result;
    }

    sub_self(vec3: Vec3) {
        this.x -= vec3.x;
        this.y -= vec3.y;
        this.z -= vec3.z;
    }

    mul(vec3: Vec3) {
        let result = new Vec3(0, 0, 0);
        result.x = this.x * vec3.x;
        result.y = this.y * vec3.y;
        result.z = this.z * vec3.z;
        return result;
    }

    mul_self(vec3: Vec3) {
        this.x *= vec3.x;
        this.y *= vec3.y;
        this.z *= vec3.z;
    }

    div(vec3: Vec3) {
        let result = new Vec3(0, 0, 0);
        result.x = this.x / vec3.x;
        result.y = this.y / vec3.y;
        result.z = this.z / vec3.z;
        return result;
    }

    div_self(vec3: Vec3) {
        this.x /= vec3.x;
        this.y /= vec3.y;
        this.z /= vec3.z;
    }

    as_raw() {
        return new Float32Array([this.x, this.y, this.z]);
    }
}

export function interpolate(value: number, target: number, speed: number) {
    return (value - target) * speed;
}
