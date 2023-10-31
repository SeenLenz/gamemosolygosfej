import { Vec2, Vec3 } from "../lin_alg";
import { Renderer } from "./renderer";

export class Obj {
  public vertex_buffer: { buffer: WebGLBuffer; attribute: number };
  public index_buffer: WebGLBuffer;
  public color_buffer: { buffer: WebGLBuffer; attribute: number };

  constructor(quad: Quad, renderer: Renderer) {
    this.vertex_buffer = renderer.create_buffer(
      renderer.gl.ARRAY_BUFFER,
      quad.positions,
      "a_pos"
    );
    this.index_buffer = renderer.gl.createBuffer() as WebGLBuffer;
    renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
    renderer.gl.bufferData(
      renderer.gl.ELEMENT_ARRAY_BUFFER,
      quad.indicies,
      renderer.gl.STATIC_DRAW
    );

    this.color_buffer = renderer.create_buffer(
      renderer.gl.ARRAY_BUFFER,
      quad.colors,
      "a_color"
    );
  }

  render(renderer: Renderer, pos: Vec2, scale: Vec2, color: Vec3) {
    renderer.gl.uniform2fv(renderer.uniform_position, pos.as_raw());
    renderer.gl.uniform2fv(renderer.uniform_scale, scale.as_raw());
    renderer.gl.uniform3fv(renderer.uniform_color, color.as_raw());

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

    renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
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
  colors: Float32Array;

  constructor(color: number[]) {
    this.positions = new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]);

    let colors: number[] = [];

    for (let i = 0; i < 6; i++) {
      colors = colors.concat(color);
    }

    this.colors = new Float32Array(colors);

    this.indicies = new Int16Array([0, 1, 2, 1, 2, 3]);
  }
}
