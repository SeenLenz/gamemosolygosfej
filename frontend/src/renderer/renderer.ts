import { Camera } from "../application/base/camera";
import { Vec2 } from "../lin_alg";
import { Obj, Quad } from "./object";
import { setup } from "./setup";

export type Texture = {
    sprites: [Vec2, number][];
    max_sprites: Vec2;
    texture: WebGLTexture;
};

export class Renderer {
    public canvas: HTMLCanvasElement;
    public gl: WebGL2RenderingContext;
    public vertex_shader: WebGLShader;
    public fragment_shader: WebGLShader;
    public program: WebGLProgram;
    public uniform_resolution: WebGLUniformLocation;
    public uniform_position: WebGLUniformLocation;
    public uniform_scale: WebGLUniformLocation;
    public uniform_rotation: WebGLUniformLocation;
    public uniform_flip: WebGLUniformLocation;
    public camera: WebGLUniformLocation;
    public camera_rot: WebGLUniformLocation;
    public sampler: WebGLUniformLocation;
    public textures: Texture[] = [];
    public base_quad_obj: Obj | undefined;
    public base_line_obj: Obj | undefined;

    constructor() {
        const vertexElement = document.querySelector(
            "#vertex_shader"
        ) as HTMLElement | null;
        const fragmentElement = document.querySelector(
            "#fragment_shader"
        ) as HTMLElement | null;

        console.log(vertexElement?.textContent?.length);

        if (!vertexElement || !fragmentElement) {
            throw new Error("Vertex or fragment shader element not found.");
        }

        const vertex_source = vertexElement.textContent || "";
        const fragment_source = fragmentElement.textContent || "";

        this.canvas = document.querySelector(
            "#main_canvas"
        ) as HTMLCanvasElement;
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

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.uniform_resolution = this.gl.getUniformLocation(
            this.program,
            "u_res"
        ) as WebGLUniformLocation;
        this.uniform_position = this.gl.getUniformLocation(
            this.program,
            "u_screen_position"
        ) as WebGLUniformLocation;
        this.uniform_scale = this.gl.getUniformLocation(
            this.program,
            "u_scale"
        ) as WebGLUniformLocation;
        this.uniform_rotation = this.gl.getUniformLocation(
            this.program,
            "u_rotation"
        ) as WebGLUniformLocation;
        this.uniform_flip = this.gl.getUniformLocation(
            this.program,
            "u_z_coord"
        ) as WebGLUniformLocation;
        this.camera = this.gl.getUniformLocation(
            this.program,
            "camera"
        ) as WebGLUniformLocation;
        this.camera_rot = this.gl.getUniformLocation(
            this.program,
            "camera_rot"
        ) as WebGLUniformLocation;
        this.sampler = this.gl.getUniformLocation(
            this.program,
            "u_sampler"
        ) as WebGLUniformLocation;
    }

    create_buffer(
        usage: number,
        content: Float32Array,
        attribute_location: string
    ) {
        let attribute = this.gl.getAttribLocation(
            this.program,
            attribute_location
        );

        let buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, content, usage);

        if (!buffer) {
            throw new Error("Failed to create buffer");
        }
        return { buffer: buffer, attribute: attribute };
    }

    create_texture(
        image_source: string,
        sprite_desc: [Vec2, number][],
        max_sprites: Vec2
    ) {
        let texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA,
            1,
            1,
            0,
            this.gl.RGBA,
            this.gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 0])
        );

        let image = new Image();
        image.src = image_source;
        image.addEventListener("load", () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                this.gl.RGBA,
                this.gl.RGBA,
                this.gl.UNSIGNED_BYTE,
                image
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MIN_FILTER,
                this.gl.NEAREST
            );
            this.gl.texParameteri(
                this.gl.TEXTURE_2D,
                this.gl.TEXTURE_MAG_FILTER,
                this.gl.NEAREST
            );
        });

        if (texture) {
            this.textures.push({
                texture: texture,
                sprites: sprite_desc,
                max_sprites: max_sprites,
            });
        }
    }

    setup() {
        const quad = new Quad();
        this.base_quad_obj = new Obj(quad.positions, quad.indicies, this);
        this.base_line_obj = new Obj(
            new Float32Array([0, 0, 1, 1]),
            undefined,
            this
        );
        this.gl.canvas.width = this.canvas.clientWidth;
        this.gl.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    run(camera: Camera) {
        this.gl.clearColor(23 / 255, 32 / 255, 36 / 255, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.uniform2f(
            this.uniform_resolution,
            this.gl.canvas.width,
            this.gl.canvas.height
        );
        this.gl.uniform3fv(this.camera, camera.convert());
        this.gl.uniform2f(
            this.camera_rot,
            Math.sin(camera.rotation),
            Math.cos(camera.rotation)
        );
    }
}
