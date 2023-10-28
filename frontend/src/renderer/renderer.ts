import { Vec2 } from "../lin_alg";
import { Obj, Quad } from "./object";
import { setup } from "./setup";

export class Renderer {
    public canvas: HTMLCanvasElement;
    public gl: WebGL2RenderingContext;
    public vertex_shader: WebGLShader;
    public fragment_shader: WebGLShader;
    public program: WebGLProgram;
    public uniform_resolution: WebGLUniformLocation | null;
    public uniform_transform: WebGLUniformLocation | null;
    public camera: WebGLUniformLocation | null;
    public textures: WebGLTexture[];

    constructor() {
        const vertexElement = document.querySelector("#vertex_shader") as HTMLElement | null;
        const fragmentElement = document.querySelector("#fragment_shader") as HTMLElement | null;

        if (!vertexElement || !fragmentElement) {
            throw new Error("Vertex or fragment shader element not found.");
        }

        const vertex_source = vertexElement.textContent || "";
        const fragment_source = fragmentElement.textContent || "";

        this.canvas = document.querySelector("#main_canvas") as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext;

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

        this.uniform_resolution = null;
        this.uniform_transform = null;
        this.camera = null;

        this.textures = [];
    }

    create_buffer(type: number, content: Float32Array, attribute_location: string) {
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

        return {buffer: buffer as WebGLBuffer, attribute: attribute}
    }

    create_texture(image_source: string) {
        let texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        let image = new Image();
        image.src = image_source;   
        image.addEventListener('load', () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,this.gl.UNSIGNED_BYTE, image);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        });

        this.textures.push(texture as WebGLTexture)
    }

    setup() {
        this.gl.canvas.width = this.canvas.clientWidth;
        this.gl.canvas.height = this.canvas.clientHeight;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.uniform_resolution = this.gl.getUniformLocation(this.program, "u_res");
        this.uniform_transform = this.gl.getUniformLocation(this.program, "u_transform");
        this.camera = this.gl.getUniformLocation(this.program, "camera");
    }

    run(camera: Float32Array) {
        this.gl.clearColor(0, 0, 1, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.uniform_resolution, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform3fv(this.camera, camera);
    }
}
