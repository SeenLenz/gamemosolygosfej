import { setup } from "./setup.js";

export class Renderer {
    constructor() {
        const vertex_source =
            document.querySelector("#vertex_shader").textContent;

        const fragment_source =
            document.querySelector("#fragment_shader").textContent;

        this.canvas = document.querySelector("#main_canvas");
        this.gl = this.canvas.getContext("webgl");

        this.vertex_shader = setup.create_shader(
            this.gl,
            this.gl.VERTEX_SHADER,
            vertex_source
        );
        this.fragment_shader = setup.create_shader(
            this.gl,
            this.gl.FRAGMENT_SHADER,
            fragment_source
        );
        this.program = setup.create_program(
            this.gl,
            this.vertex_shader,
            this.fragment_shader
        );

        this.attributes;
        this.buffers;
    }

    create_buffer(type, content, attribute_location) {
        this.attributes = this.gl.getAttribLocation(
            this.program,
            attribute_location
        );

        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(type, buffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(content),
            this.gl.STATIC_DRAW
        );

        this.buffers = buffer;
    }

    setup() {
        this.gl.canvas.width = this.gl.canvas.clientWidth;
        this.gl.canvas.height = this.gl.canvas.clientHeight;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        const positions = [0, -1, -1, 1, 1, 1];

        this.create_buffer(this.gl.ARRAY_BUFFER, positions, "a_pos");
    }

    run() {
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.enableVertexAttribArray(this.attributes);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers);
        this.gl.vertexAttribPointer(
            this.attributes,
            2,
            this.gl.FLOAT,
            false,
            0,
            0
        );
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3
}
