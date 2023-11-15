import { camera } from "../app";
import { Vec2 } from "../lin_alg";
import { Renderer } from "./renderer";

export interface Renderable {
    pos: Vec2;
    size: Vec2;
    rotation: number;
    x_direction: number;
    texture_buffer: { buffer: WebGLBuffer; attribute: number };
    texture_index: number;
    z_coord: number;
    texture_coords: Float32Array;
}

export class Obj {
    public vertex_buffer: { buffer: WebGLBuffer; attribute: number };
    public index_buffer: WebGLBuffer | undefined;

    constructor(positions: Float32Array, indicies: Int16Array | undefined, renderer: Renderer) {
        this.vertex_buffer = renderer.create_buffer(
            renderer.gl.STATIC_DRAW,
            positions,
            "a_pos"
        );
        this.index_buffer = renderer.gl.createBuffer() as WebGLBuffer;
        renderer.gl.bindBuffer(
            renderer.gl.ELEMENT_ARRAY_BUFFER,
            this.index_buffer
        );
        if (!indicies) {
            return;
        }
        renderer.gl.bufferData(
            renderer.gl.ELEMENT_ARRAY_BUFFER,
            indicies,
            renderer.gl.STATIC_DRAW
        );
    }

    render(renderer: Renderer, obj: Renderable) {
        if (
            obj.pos.x + obj.size.x - camera.pos.x < 0 ||
            obj.pos.y + obj.size.y - camera.pos.y < 0 ||
            obj.pos.x - camera.pos.x > camera.width * camera.scale ||
            obj.pos.y - camera.pos.y > camera.height * camera.scale || 
            !this.index_buffer
        ) {
            return;
        }

        renderer.gl.uniform2f(renderer.uniform_position, obj.pos.x, obj.pos.y);
        renderer.gl.uniform2f(renderer.uniform_scale, obj.size.x, obj.size.y);
        renderer.gl.uniform2f(
            renderer.uniform_rotation,
            Math.sin(obj.rotation),
            Math.cos(obj.rotation)
        );

        renderer.gl.uniform1f(renderer.uniform_flip, obj.z_coord);
        renderer.gl.enableVertexAttribArray(this.vertex_buffer.attribute);
        renderer.gl.bindBuffer(
            renderer.gl.ARRAY_BUFFER,
            this.vertex_buffer.buffer
        );
        renderer.gl.vertexAttribPointer(
            this.vertex_buffer.attribute,
            2,
            renderer.gl.FLOAT,
            false,
            0,
            0
        );

        renderer.gl.enableVertexAttribArray(obj.texture_buffer.attribute);
        renderer.gl.bindBuffer(
            renderer.gl.ARRAY_BUFFER,
            obj.texture_buffer.buffer
        );
        renderer.gl.vertexAttribPointer(
            obj.texture_buffer.attribute,
            2,
            renderer.gl.FLOAT,
            true,
            0,
            0
        );

        renderer.gl.activeTexture(renderer.gl.TEXTURE0);
        renderer.gl.bindTexture(
            renderer.gl.TEXTURE_2D,
            renderer.textures[obj.texture_index].texture
        );
        renderer.gl.uniform1i(renderer.sampler, 0);
            
        renderer.gl.bindBuffer(
            renderer.gl.ELEMENT_ARRAY_BUFFER,
            this.index_buffer
        );
        renderer.gl.drawElements(
            renderer.gl.TRIANGLES,
            6,
            renderer.gl.UNSIGNED_SHORT,
            0
        );
    }
}

export class Quad {
    positions: Float32Array;
    indicies: Int16Array;

    constructor() {
        this.positions = new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]);

        this.indicies = new Int16Array([0, 1, 2, 1, 2, 3]);
    }
}
