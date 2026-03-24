/**
 * Galerie circulaire WebGL (port du composant React + ogl).
 */
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
  type OGLRenderingContext
} from 'ogl';

export interface CircularGalleryItem {
  image: string;
  text: string;
}

export interface CircularGalleryConfig {
  items?: CircularGalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: object): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== 'constructor') {
      const v = (instance as Record<string, unknown>)[key];
      if (typeof v === 'function') {
        (instance as Record<string, unknown>)[key] = (v as (...a: unknown[]) => unknown).bind(instance);
      }
    }
  });
}

function textHeightFromFont(font: string): number {
  const m = font.match(/(\d+(?:\.\d+)?)px/);
  const px = m ? parseFloat(m[1]) : 30;
  return Math.ceil(px * 1.2);
}

function createTextTexture(
  gl: OGLRenderingContext,
  text: string,
  font = 'bold 30px sans-serif',
  color = 'black'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('2d context');
  }
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = textHeightFromFont(font);
  canvas.width = textWidth + 52;
  canvas.height = textHeight + 34;
  context.font = font;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(255,255,255,0.68)';
  const bgRadius = 12;
  const bgW = canvas.width - 10;
  const bgH = canvas.height - 8;
  const bgX = (canvas.width - bgW) / 2;
  const bgY = (canvas.height - bgH) / 2;
  context.beginPath();
  context.moveTo(bgX + bgRadius, bgY);
  context.lineTo(bgX + bgW - bgRadius, bgY);
  context.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + bgRadius);
  context.lineTo(bgX + bgW, bgY + bgH - bgRadius);
  context.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - bgRadius, bgY + bgH);
  context.lineTo(bgX + bgRadius, bgY + bgH);
  context.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - bgRadius);
  context.lineTo(bgX, bgY + bgRadius);
  context.quadraticCurveTo(bgX, bgY, bgX + bgRadius, bgY);
  context.closePath();
  context.fill();

  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.shadowColor = 'rgba(255,255,255,0.85)';
  context.shadowBlur = 4;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.lineWidth = 3;
  context.strokeStyle = 'rgba(255,255,255,0.95)';
  context.strokeText(text, canvas.width / 2, canvas.height / 2 + 1);
  context.shadowBlur = 0;
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  private gl: OGLRenderingContext;
  private plane: Mesh;
  mesh!: Mesh;

  constructor(opts: {
    gl: OGLRenderingContext;
    plane: Mesh;
    text: string;
    textColor?: string;
    font?: string;
  }) {
    const { gl, plane, text, textColor = '#545050', font = '30px sans-serif' } = opts;
    this.gl = gl;
    this.plane = plane;
    this.createMesh(text, textColor, font);
  }

  private createMesh(text: string, textColor: string, font: string): void {
    const { texture, width, height } = createTextTexture(this.gl, text, font, textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textH = this.plane.scale.y * 0.22;
    const textW = textH * aspect;
    this.mesh.scale.set(textW, textH, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textH * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  extra = 0;
  geometry: Plane;
  gl: OGLRenderingContext;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: { width: number; height: number };
  text: string;
  viewport: { width: number; height: number };
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  speed = 0;
  scale = 1;
  padding = 2;
  width = 0;
  widthTotal = 0;
  x = 0;
  isBefore = false;
  isAfter = false;

  constructor(opts: {
    geometry: Plane;
    gl: OGLRenderingContext;
    image: string;
    index: number;
    length: number;
    renderer: Renderer;
    scene: Transform;
    screen: { width: number; height: number };
    text: string;
    viewport: { width: number; height: number };
    bend: number;
    textColor: string;
    borderRadius: number;
    font: string;
  }) {
    this.geometry = opts.geometry;
    this.gl = opts.gl;
    this.image = opts.image;
    this.index = opts.index;
    this.length = opts.length;
    this.renderer = opts.renderer;
    this.scene = opts.scene;
    this.screen = opts.screen;
    this.text = opts.text;
    this.viewport = opts.viewport;
    this.bend = opts.bend;
    this.textColor = opts.textColor;
    this.borderRadius = opts.borderRadius;
    this.font = opts.font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader(): void {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        /* Éviter NaN dans le fragment tant que la texture n’est pas chargée */
        uImageSizes: { value: [1, 1] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const applyImage = (el: HTMLImageElement | HTMLCanvasElement): void => {
      texture.image = el;
      const w = 'naturalWidth' in el ? el.naturalWidth : el.width;
      const h = 'naturalHeight' in el ? el.naturalHeight : el.height;
      this.program.uniforms['uImageSizes'].value = [Math.max(1, w), Math.max(1, h)];
    };

    const placeholderCanvas = (): HTMLCanvasElement => {
      const c = document.createElement('canvas');
      c.width = 800;
      c.height = 600;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createLinearGradient(0, 0, 800, 600);
        g.addColorStop(0, '#1e3a5f');
        g.addColorStop(0.5, '#5c6478');
        g.addColorStop(1, '#e8e4dc');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, 400, 300);
      }
      return c;
    };

    const loadFallback = (): void => {
      applyImage(placeholderCanvas());
    };

    const resolvedUrl =
      this.image.startsWith('http://') || this.image.startsWith('https://')
        ? this.image
        : new URL(this.image, window.location.href).href;

    void (async () => {
      try {
        const res = await fetch(resolvedUrl, { mode: 'cors', credentials: 'omit', cache: 'force-cache' });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('img load'));
          img.src = blobUrl;
        });
        applyImage(img);
        URL.revokeObjectURL(blobUrl);
      } catch {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('direct img'));
            img.src = resolvedUrl;
          });
          applyImage(img);
        } catch {
          loadFallback();
        }
      }
    })();
  }

  createMesh(): void {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle(): void {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  update(scroll: { current: number; last: number; target: number; ease: number }, direction: 'left' | 'right'): void {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms['uTime'].value += 0.04;
    this.program.uniforms['uSpeed'].value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = false;
      this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = false;
      this.isAfter = false;
    }
  }

  onResize(opts?: { screen?: { width: number; height: number }; viewport?: { width: number; height: number } }): void {
    if (opts?.screen) {
      this.screen = opts.screen;
    }
    if (opts?.viewport) {
      this.viewport = opts.viewport;
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.program.uniforms['uPlaneSizes'].value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

export class CircularGalleryApp {
  private container: HTMLElement;
  private scrollSpeed: number;
  private scroll: { ease: number; current: number; target: number; last: number };
  private onCheckDebounce: () => void;
  private renderer!: Renderer;
  private gl!: OGLRenderingContext;
  private camera!: Camera;
  private scene!: Transform;
  private planeGeometry!: Plane;
  private mediasImages: CircularGalleryItem[] = [];
  medias: Media[] = [];
  private screen = { width: 0, height: 0 };
  private viewport = { width: 0, height: 0 };
  private isDown = false;
  private scrollPosition = 0;
  private start = 0;
  private raf = 0;
  /** Quand false, la boucle requestAnimationFrame est arrêtée (économie GPU hors viewport). */
  private animating = true;
  private boundOnResize!: () => void;
  private boundOnWheel!: (e: WheelEvent) => void;
  private boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  private boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  private boundOnTouchUp!: () => void;
  private resizeObserver?: ResizeObserver;

  constructor(container: HTMLElement, config: CircularGalleryConfig = {}) {
    const {
      items,
      bend = 1,
      textColor = '#ffffff',
      borderRadius = 0,
      font = 'bold 30px Figtree, Source Sans 3, sans-serif',
      scrollSpeed = 2,
      scrollEase = 0.05
    } = config;

    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(() => this.onCheck(), 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.addEventListeners();
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);
    requestAnimationFrame(() => {
      this.onResize();
      requestAnimationFrame(() => this.onResize());
    });
    this.update();
  }

  /** Recalcule après changement de taille du conteneur (ex. navigation) */
  resizeContainer(): void {
    this.onResize();
  }

  private createRenderer(): void {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      /* 1.5 au lieu de 2 : suffisant visuellement, moins de pixels à traiter par frame */
      dpr: Math.min(window.devicePixelRatio || 1, 1.25)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    const canvas = this.renderer.gl.canvas as HTMLCanvasElement;
    this.container.appendChild(canvas);
    canvas.addEventListener(
      'webglcontextlost',
      (ev) => {
        ev.preventDefault();
        this.pause();
      },
      false
    );
  }

  private createCamera(): void {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  private createScene(): void {
    this.scene = new Transform();
  }

  private createGeometry(): void {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 18,
      widthSegments: 36
    });
  }

  private createMedias(
    items: CircularGalleryItem[] | undefined,
    bend: number,
    textColor: string,
    borderRadius: number,
    font: string
  ): void {
    const defaultItems: CircularGalleryItem[] = [
      { image: 'https://picsum.photos/seed/1/800/600?grayscale', text: 'Bridge' },
      { image: 'https://picsum.photos/seed/2/800/600?grayscale', text: 'Desk' },
      { image: 'https://picsum.photos/seed/3/800/600?grayscale', text: 'Water' },
      { image: 'https://picsum.photos/seed/4/800/600?grayscale', text: 'Berry' }
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map(
      (data, index) =>
        new Media({
          geometry: this.planeGeometry,
          gl: this.gl,
          image: data.image,
          index,
          length: this.mediasImages.length,
          renderer: this.renderer,
          scene: this.scene,
          screen: this.screen,
          text: data.text,
          viewport: this.viewport,
          bend,
          textColor,
          borderRadius,
          font
        })
    );
  }

  private onTouchDown(e: MouseEvent | TouchEvent): void {
    this.isDown = true;
    this.scrollPosition = this.scroll.current;
    this.start = 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  private onTouchMove(e: MouseEvent | TouchEvent): void {
    if (!this.isDown) {
      return;
    }
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scrollPosition + distance;
  }

  private onTouchUp(): void {
    this.isDown = false;
    this.onCheck();
  }

  private onWheel(e: WheelEvent): void {
    const delta =
      e.deltaY ||
      (e as unknown as { wheelDelta?: number }).wheelDelta ||
      (e as unknown as { detail?: number }).detail ||
      0;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }

  private onCheck(): void {
    if (!this.medias || !this.medias[0]) {
      return;
    }
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  private onResize = (): void => {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.screen = {
      width: w,
      height: h
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  };

  private update = (): void => {
    if (!this.animating) {
      return;
    }
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction: 'left' | 'right' = this.scroll.current > this.scroll.last ? 'right' : 'left';
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    if (this.animating) {
      this.raf = window.requestAnimationFrame(this.update);
    }
  };

  /** Met en pause le rendu WebGL (à appeler quand le bloc n’est pas visible). */
  pause(): void {
    this.animating = false;
    window.cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /**
   * Reprend la boucle de rendu.
   * Toujours reprogramme rAF : après onglet en arrière-plan / veille, le navigateur peut
   * arrêter la chaîne requestAnimationFrame alors que `animating` reste true — sans ça,
   * la galerie reste figée indéfiniment.
   */
  resume(): void {
    this.animating = true;
    window.cancelAnimationFrame(this.raf);
    this.raf = window.requestAnimationFrame(this.update);
  }

  private addEventListeners(): void {
    this.boundOnResize = this.onResize;
    this.boundOnWheel = (e: WheelEvent) => this.onWheel(e);
    this.boundOnTouchDown = (e: MouseEvent | TouchEvent) => this.onTouchDown(e);
    this.boundOnTouchMove = (e: MouseEvent | TouchEvent) => this.onTouchMove(e);
    this.boundOnTouchUp = () => this.onTouchUp();
    window.addEventListener('resize', this.boundOnResize);
    /**
     * Molette + début de drag : limités au conteneur de la galerie.
     * Avant : écoute sur `window` → tout scroll de page et tout clic déclenchaient la galerie (effet « bug »).
     */
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: true });
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    window.addEventListener('mousemove', this.boundOnTouchMove);
    window.addEventListener('mouseup', this.boundOnTouchUp);
    window.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    window.addEventListener('touchend', this.boundOnTouchUp);
  }

  destroy(): void {
    this.animating = false;
    window.cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    window.removeEventListener('resize', this.boundOnResize);
    this.container.removeEventListener('wheel', this.boundOnWheel);
    this.container.removeEventListener('mousedown', this.boundOnTouchDown);
    this.container.removeEventListener('touchstart', this.boundOnTouchDown);
    window.removeEventListener('mousemove', this.boundOnTouchMove);
    window.removeEventListener('mouseup', this.boundOnTouchUp);
    window.removeEventListener('touchmove', this.boundOnTouchMove);
    window.removeEventListener('touchend', this.boundOnTouchUp);
    const canvas = this.renderer?.gl?.canvas;
    if (canvas instanceof HTMLCanvasElement && canvas.parentNode === this.container) {
      this.container.removeChild(canvas);
    }
    this.renderer?.gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
