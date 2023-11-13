import { renderer } from "../../app";
import { Vec2 } from "../../lin_alg";
import { Effect } from "./effects";
import { SpriteSheets } from "./textures";

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

export class Ray extends Effect {
    constructor() {
        super(Vec2.zeros(), Vec2.zeros(), 0, SpriteSheets.Debug, 0, 0, -1); 
        this.set_texture_coords(
            Vec2.uniform(1),
            Vec2.zeros(),
        );
    }

    set_pos(p1: Point) {
        this.pos.set_vec(p1);
    }
    
    animate() {
        if (!renderer.base_quad_obj) {
            return;
        }
        renderer.gl.uniform2fv(renderer.uniform_position, this.pos.as_raw());
        renderer.gl.uniform2fv(renderer.uniform_scale, Vec2.uniform(3).as_raw());
        renderer.gl.uniform2f(
            renderer.uniform_rotation,
            Math.sin(this.rotation),
            Math.cos(this.rotation)
        );

        renderer.gl.uniform1f(renderer.uniform_flip, this.z_coord);
        renderer.gl.enableVertexAttribArray(renderer.base_quad_obj.vertex_buffer.attribute);
        renderer.gl.bindBuffer(
            renderer.gl.ARRAY_BUFFER,
            renderer.base_quad_obj.vertex_buffer.buffer
        );
        renderer.gl.vertexAttribPointer(
            renderer.base_quad_obj.vertex_buffer.attribute,
            2,
            renderer.gl.FLOAT,
            false,
            0,
            0
        );

        renderer.gl.enableVertexAttribArray(this.texture_buffer.attribute);
        renderer.gl.bindBuffer(
            renderer.gl.ARRAY_BUFFER,
            this.texture_buffer.buffer
        );
        renderer.gl.vertexAttribPointer(
            this.texture_buffer.attribute,
            2,
            renderer.gl.FLOAT,
            true,
            0,
            0
        );

        renderer.gl.activeTexture(renderer.gl.TEXTURE0);
        renderer.gl.bindTexture(
            renderer.gl.TEXTURE_2D,
            renderer.textures[this.texture_index].texture
        );
        renderer.gl.uniform1i(renderer.sampler, 0);
            
        renderer.gl.bindBuffer(
            renderer.gl.ELEMENT_ARRAY_BUFFER,
            renderer.base_quad_obj.index_buffer as Int16Array
        );
        renderer.gl.drawElements(
            renderer.gl.TRIANGLES,
            6,
            renderer.gl.UNSIGNED_SHORT,
            0
        );
    }
}

export function create_line(vec: Vec2, p2: Point): Line {
    const x = -1 * vec.y;
    const y = vec.x;

    const normal = new Vec2(x, y).normalize();

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
    if (Math.abs(l1.a - l2.a) < 0.1 || Math.abs(l1.b - l2.b) < 0.1) {
        return undefined;
    }

    let x = (l1.b * l2.c - l2.b * l1.c) / (l1.a * l2.b - l2.a * l1.b);
    let y;
    if (float_eq(l1.b, 0)) {
        y = (-l2.c - l2.a * x) / l2.b;
    } else {
        y = (-l1.c - l1.a * x) / l1.b;
    }
    return new Vec2(x, y);
}

export function ray_side_intersection(ray: Line, side: Section) {
    const intersection_point = line_intersection_point(ray, side.line);
    if (!intersection_point) {
        return undefined;
    }

    if (
        ((intersection_point.x >= side.p1.x &&
            intersection_point.x <= side.p2.x) ||
            (intersection_point.x <= side.p1.x &&
                intersection_point.x >= side.p2.x)) &&
        ((intersection_point.y >= side.p1.y &&
            intersection_point.y <= side.p2.y) ||
            (intersection_point.y <= side.p1.y &&
                intersection_point.y >= side.p2.y))
    ) {
        return { point: intersection_point, side_intersection: true };
    }
    return { point: intersection_point, side_intersection: false };
}
