import { Vec2 } from "../lin_alg";
import { Obj, Quad } from "./object";
import { setup } from "./setup";

export class Renderer {
  public canvas: HTMLCanvasElement;
  public gl: WebGL2RenderingContext;
  public vertex_shader: WebGLShader;
  public fragment_shader: WebGLShader;
  public program: WebGLProgram;
  public uniform_resolution: WebGLUniformLocation;
  public uniform_position: WebGLUniformLocation;
  public uniform_scale: WebGLUniformLocation;
  public uniform_color: WebGLUniformLocation;
  public camera: WebGLUniformLocation;
  public textures: WebGLTexture[];
  public base_quad_obj: Obj | undefined;

  constructor() {
    const vertexElement = document.querySelector(
      "#vertex_shader"
    ) as HTMLElement | null;
    const fragmentElement = document.querySelector(
      "#fragment_shader"
    ) as HTMLElement | null;

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
    this.camera = this.gl.getUniformLocation(
      this.program,
      "camera"
    ) as WebGLUniformLocation;
    this.uniform_color = this.gl.getUniformLocation(
      this.program,
      "u_color"
    ) as WebGLUniformLocation;

    this.textures = [];
  }

  create_buffer(
    type: number,
    content: Float32Array,
    attribute_location: string
  ) {
    let attribute = this.gl.getAttribLocation(this.program, attribute_location);

    let buffer = this.gl.createBuffer();
    this.gl.bindBuffer(type, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, content, this.gl.STATIC_DRAW);

    if (!buffer) {
      throw new Error("Failed to create buffer");
    }
    return { buffer: buffer, attribute: attribute };
  }

  create_texture(image_source: string) {
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
      new Uint8Array([0, 0, 255, 255])
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
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    });

    this.textures.push(texture as WebGLTexture);
  }

  setup() {
    const quad = new Quad([1, 1, 1]);
    this.base_quad_obj = new Obj(quad, this);
    this.gl.canvas.width = this.canvas.clientWidth;
    this.gl.canvas.height = this.canvas.clientHeight;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  run(camera: Float32Array) {
    this.gl.clearColor(0, 0, 0.2, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);
    this.gl.uniform2f(
      this.uniform_resolution,
      this.gl.canvas.width,
      this.gl.canvas.height
    );
    this.gl.uniform3fv(this.camera, camera);
  }
}
