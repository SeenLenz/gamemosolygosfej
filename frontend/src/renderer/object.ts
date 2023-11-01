import { renderer } from "../app";
import { GameObject } from "../application/base/gameobject";
import { Renderer } from "./renderer";

export class Obj {
    public vertex_buffer: {buffer: WebGLBuffer, attribute: number};
    public index_buffer: WebGLBuffer;

    constructor(quad: Quad, renderer: Renderer) {
        this.vertex_buffer = renderer.create_buffer(renderer.gl.STATIC_DRAW, quad.positions, "a_pos");
        this.index_buffer = renderer.gl.createBuffer()as WebGLBuffer;
        renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        renderer.gl.bufferData(renderer.gl.ELEMENT_ARRAY_BUFFER, quad.indicies, renderer.gl.STATIC_DRAW);
    }

    render(renderer: Renderer, obj: GameObject) {
        renderer.gl.uniform2fv(renderer.uniform_position, obj.pos.as_raw());
        renderer.gl.uniform2fv(renderer.uniform_scale, obj.size.as_raw());
        renderer.gl.uniform2f(renderer.uniform_rotation, Math.sin(obj.rotation), Math.cos(obj.rotation));
        renderer.gl.uniform1i(renderer.uniform_flip, obj.texture_flip);

        renderer.gl.enableVertexAttribArray(this.vertex_buffer.attribute);
        renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, this.vertex_buffer.buffer);
        renderer.gl.vertexAttribPointer(
            this.vertex_buffer.attribute,
            2,
            renderer.gl.FLOAT,
            false,
            0,
            0
        );

        renderer.gl.enableVertexAttribArray(obj.texture_buffer.attribute);
        renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, obj.texture_buffer.buffer);
        renderer.gl.vertexAttribPointer(
            obj.texture_buffer.attribute,
            2,
            renderer.gl.FLOAT,
            true,
            0,
            0
        );

        renderer.gl.bindTexture(renderer.gl.TEXTURE_2D, renderer.textures[obj.texture_index].texture);
        renderer.gl.uniform1i(renderer.sampler, 0);

        renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        renderer.gl.drawElements(renderer.gl.TRIANGLES, 6, renderer.gl.UNSIGNED_SHORT, 0);
    }
}



export class Quad {
    positions: Float32Array;
    indicies: Int16Array;
    
    constructor() {
        this.positions = new Float32Array(
            [0, 1,  
            0, 0,
            1, 1,
            1, 0,]
        );
    
        this.indicies = new Int16Array(
            [0, 1, 2,
            1, 2, 3]
        );
    }
} 
