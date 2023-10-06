export class Obj {
    constructor(vertecies, indicies, colors, renderer) {
        this.vertex_buffer = renderer.create_buffer(renderer.gl.ARRAY_BUFFER, vertecies, "a_pos");
        this.index_buffer = renderer.gl.createBuffer();
        renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        renderer.gl.bufferData(renderer.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indicies), renderer.gl.STATIC_DRAW);

        this.color_buffer = renderer.create_buffer(renderer.gl.ARRAY_BUFFER, colors, "a_color");

        this.transform = [0., 0., 0.];
    }

    render(renderer) {
        renderer.gl.uniform3fv(renderer.uniform_transform, this.transform);

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


        renderer.gl.enableVertexAttribArray(this.color_buffer.attribute);
        renderer.gl.bindBuffer(renderer.gl.ARRAY_BUFFER, this.color_buffer.buffer);
        renderer.gl.vertexAttribPointer(
            this.color_buffer.attribute,
            3,
            renderer.gl.FLOAT,
            false,
            0,
            0
        );

        renderer.gl.bindBuffer(renderer.gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);

        renderer.gl.drawElements(renderer.gl.TRIANGLES, 6, renderer.gl.UNSIGNED_SHORT, 0);
    }
}