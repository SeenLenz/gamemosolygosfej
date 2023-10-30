export class Vec2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    set_vec(vec2: Vec2) {
        this.x = vec2.x;
        this.y = vec2.y;
    }

    add(vec2: Vec2) {
        let result = new Vec2(0, 0);
        result.x = this.x + vec2.x;
        result.y = this.y + vec2.y;
        return result;
    }

    add_self(vec2: Vec2) {
        this.x += vec2.x;
        this.y += vec2.y;
    }

    sub(vec2: Vec2) {
        let result = new Vec2(0, 0);
        result.x = this.x - vec2.x;
        result.y = this.y - vec2.y;
        return result;
    }

    sub_self(vec2: Vec2) {
        this.x -= vec2.x;
        this.y -= vec2.y;
    }


    mul(vec2: Vec2) {
        let result = new Vec2(0, 0);
        result.x = this.x * vec2.x;
        result.y = this.y * vec2.y;
        return result;
    }

    mul_self(vec2: Vec2) {
        this.x *= vec2.x;
        this.y *= vec2.y;
    }

    div(vec2: Vec2) {
        let result = new Vec2(0, 0);
        result.x = this.x / vec2.x;
        result.y = this.y / vec2.y;
        return result;
    }

    div_self(vec2: Vec2) {
        this.x /= vec2.x;
        this.y /= vec2.y;
    }

    normalize() {
        let result = new Vec2(0, 0);
        let a = (this.x / this.y);
        result.y = Math.sqrt(1 / (a * a + 1));
        result.x = result.y * a;
        return result;
    }

    as_raw() {
        return new Float32Array([this.x, this.y]);
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