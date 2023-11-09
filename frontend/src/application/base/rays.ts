import { Vec2 } from "../../lin_alg";

export type Line = {
    a: number;
    b: number;
    c: number;
};

export interface Point {
    x: number;
    y: number;
}

export type Section = {
    line: Line;
    p1: Point;
    p2: Point;
};

export function float_eq(a: number, b: number) {
    return Math.abs(a - b) < 1e-5;
}

export function create_line(vec: Vec2, p2: Point): Line {
    const x = -1 * vec.y;
    const y = vec.x;

    const normal = Vec2.from({ x, y }).normalize();

    return {
        a: normal.x,
        b: normal.y,
        c: -1 * (normal.x * p2.x + normal.y * p2.y),
    };
}

export function create_section(p1: Point, p2: Point): Section {
    const line = create_line((p1 as Vec2).sub(p2), p2);
    return {
        line: line,
        p1: p1,
        p2: p2,
    };
}

export function line_intersection_point(l1: Line, l2: Line) {
    if (Math.abs(l1.a - l2.a) < 1e-5 && Math.abs(l1.b - l2.b) < 1e-5) {
        return undefined;
    }

    let x = (l1.b * l2.c - l2.b * l1.c) / (l1.a * l2.b - l2.a * l1.b);
    let y = (-l1.c - l1.a * x) / l1.b;

    return new Vec2(x, y);
}

export function ray_side_collision(ray: Line, side: Section) {
    const intersection_point = line_intersection_point(ray, side.line);
    if (!intersection_point) {
        return undefined;
    }
    if (
        float_eq(
            Math.abs(side.p1.x - intersection_point.x) +
                Math.abs(side.p2.x - intersection_point.x),
            Math.abs(side.p1.x - side.p2.x)
        )
    ) {
        if (
            float_eq(
                Math.abs(side.p1.y - intersection_point.y) +
                    Math.abs(side.p2.y - intersection_point.y),
                Math.abs(side.p1.y - side.p2.y)
            )
        ) {
            return intersection_point;
        }
    }

    return undefined;
}
