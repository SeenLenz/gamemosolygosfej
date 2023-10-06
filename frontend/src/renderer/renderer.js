import { setup } from "./setup.js";

export class Renderer {
    constructor() {
        const vertex_source =
            document.querySelector("#vertex_shader").textContent;

        const fragment_source =
            document.querySelector("#fragment_shader").textContent;

        this.canvas = document.querySelector("#main_canvas");
        this.gl = this.canvas.getContext("webgl2");

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

        this.uniform_resolution;
        this.uniform_transform;
    }

    create_buffer(type, content, attribute_location) {
        let attribute = this.gl.getAttribLocation(
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

        return {buffer: buffer, attribute: attribute}
    }

    setup() {
        this.gl.canvas.width = this.gl.canvas.clientWidth;
        this.gl.canvas.height = this.gl.canvas.clientHeight;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.uniform_resolution = this.gl.getUniformLocation(this.program, "u_res");
        this.uniform_transform = this.gl.getUniformLocation(this.program, "u_transform");
    }

    run() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.uniform_resolution, this.gl.canvas.width / this.gl.canvas.height);
    }
}
