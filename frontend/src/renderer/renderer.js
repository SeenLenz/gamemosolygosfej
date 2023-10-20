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

        this.textures = [];
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

    create_texture(image_source) {
        let texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        let image = new Image();
        image.src = image_source;   
        image.addEventListener('load', () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,this.gl.UNSIGNED_BYTE, image);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        });

        return this.textures.push(texture);
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
        this.gl.uniform1f(this.uniform_resolution, this.gl.canvas.height / this.gl.canvas.width);
    }
}
