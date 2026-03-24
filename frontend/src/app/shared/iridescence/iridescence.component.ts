import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;

  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5) * uColor;
  gl_FragColor = vec4(col, 1.0);
}
`;

@Component({
  selector: 'app-iridescence',
  standalone: true,
  templateUrl: './iridescence.component.html',
  styleUrl: './iridescence.component.scss'
})
export class IridescenceComponent implements AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  /** RGB 0–1 */
  @Input() color: [number, number, number] = [0.5, 0.6, 0.8];
  @Input() speed = 1.0;
  @Input() amplitude = 0.1;
  @Input() mouseReact = true;
  /** Si true, le suivi souris utilise la fenêtre (effet même au-dessus du formulaire) */
  @Input() useWindowMouse = true;

  private animateId = 0;
  private renderer?: Renderer;
  private program?: Program;
  private mesh?: Mesh;
  private gl?: WebGLRenderingContext | WebGL2RenderingContext;
  private resizeObserver?: ResizeObserver;
  private resizeHandler = () => this.resize();
  private mouseHandler = (e: MouseEvent) => this.handleMouseMove(e);
  private visibilityHandler = () => {
    if (document.visibilityState === 'visible') {
      requestAnimationFrame(() => this.resize());
    }
  };

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => this.initGl());
  }

  ngOnDestroy(): void {
    this.teardown();
  }

  private initGl(): void {
    const ctn = this.containerRef.nativeElement;
    if (!ctn) {
      return;
    }

    this.renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = this.renderer.gl;
    this.gl = gl;
    gl.clearColor(1, 1, 1, 1);

    const geometry = new Triangle(gl);
    this.program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...this.color) },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uAmplitude: { value: this.amplitude },
        uSpeed: { value: this.speed }
      }
    });

    this.mesh = new Mesh(gl, { geometry, program: this.program });

    /* Canvas dans le DOM avant le premier resize (dimensions du conteneur fiables) */
    ctn.appendChild(gl.canvas);

    window.addEventListener('resize', this.resizeHandler, false);
    document.addEventListener('visibilitychange', this.visibilityHandler, false);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(ctn);

    this.resize();
    requestAnimationFrame(() => {
      this.resize();
      requestAnimationFrame(() => this.resize());
    });

    const loop = (t: number) => {
      this.animateId = requestAnimationFrame(loop);
      if (this.program) {
        this.program.uniforms['uTime'].value = t * 0.001;
      }
      if (this.renderer && this.mesh) {
        this.renderer.render({ scene: this.mesh });
      }
    };
    this.animateId = requestAnimationFrame(loop);

    if (this.mouseReact) {
      const target: Window | HTMLElement = this.useWindowMouse ? window : ctn;
      target.addEventListener('mousemove', this.mouseHandler as EventListener, { passive: true });
    }
  }

  private resize(): void {
    const ctn = this.containerRef?.nativeElement;
    if (!ctn || !this.renderer || !this.program || !this.gl) {
      return;
    }
    const gl = this.gl;
    const scale = 1;
    const w = Math.max(1, ctn.offsetWidth);
    const h = Math.max(1, ctn.offsetHeight);
    this.renderer.setSize(w * scale, h * scale);
    this.program.uniforms['uResolution'].value = new Color(
      gl.canvas.width,
      gl.canvas.height,
      gl.canvas.width / Math.max(gl.canvas.height, 1)
    );
  }

  private handleMouseMove(e: MouseEvent): void {
    const ctn = this.containerRef?.nativeElement;
    const program = this.program;
    if (!ctn || !program) {
      return;
    }
    const rect = ctn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(rect.width, 1);
    const y = 1.0 - (e.clientY - rect.top) / Math.max(rect.height, 1);
    const u = program.uniforms['uMouse'].value as Float32Array;
    u[0] = x;
    u[1] = y;
  }

  private teardown(): void {
    cancelAnimationFrame(this.animateId);
    window.removeEventListener('resize', this.resizeHandler, false);
    document.removeEventListener('visibilitychange', this.visibilityHandler, false);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    const ctn = this.containerRef?.nativeElement;
    if (this.mouseReact) {
      const target: Window | HTMLElement = this.useWindowMouse ? window : ctn;
      target?.removeEventListener('mousemove', this.mouseHandler as EventListener);
    }

    const gl = this.gl;
    const canvas = gl?.canvas;
    if (ctn && canvas instanceof HTMLCanvasElement && canvas.parentNode === ctn) {
      ctn.removeChild(canvas);
    }
    gl?.getExtension('WEBGL_lose_context')?.loseContext();

    this.renderer = undefined;
    this.program = undefined;
    this.mesh = undefined;
    this.gl = undefined;
  }
}
