import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';

class Pixel {
  private readonly width: number;
  private readonly height: number;
  private readonly speed: number;
  private readonly sizeStep: number;
  private readonly minSize = 0.5;
  private readonly maxSizeInteger = 2;
  private readonly maxSize: number;
  private readonly counterStep: number;

  private counter = 0;
  private size = 0;
  private isReverse = false;
  private isShimmer = false;

  isIdle = false;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly x: number,
    private readonly y: number,
    private readonly color: string,
    speed: number,
    private readonly delay: number,
    width: number,
    height: number
  ) {
    this.width = width;
    this.height = height;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.sizeStep = Math.random() * 0.4;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
  }

  appear(): void {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear(): void {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }
    this.size -= 0.1;
    this.draw();
  }

  private getRandomValue(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private draw(): void {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
  }

  private shimmer(): void {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    this.size += this.isReverse ? -this.speed : this.speed;
  }
}

type PixelCardVariant = 'default' | 'blue' | 'yellow' | 'pink';

interface VariantConfig {
  activeColor: string | null;
  gap: number;
  speed: number;
  colors: string;
  noFocus: boolean;
}

const VARIANTS: Record<PixelCardVariant, VariantConfig> = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: '#f8fafc,#f1f5f9,#cbd5e1',
    noFocus: false
  },
  blue: {
    activeColor: '#e0f2fe',
    gap: 10,
    speed: 25,
    colors: '#e0f2fe,#7dd3fc,#0ea5e9',
    noFocus: false
  },
  yellow: {
    activeColor: '#fef08a',
    gap: 3,
    speed: 20,
    colors: '#fef08a,#fde047,#eab308',
    noFocus: false
  },
  pink: {
    activeColor: '#fecdd3',
    gap: 6,
    speed: 80,
    colors: '#fecdd3,#fda4af,#e11d48',
    noFocus: true
  }
};

@Component({
  selector: 'app-pixel-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pixel-card.component.html',
  styleUrl: './pixel-card.component.scss'
})
export class PixelCardComponent implements AfterViewInit, OnDestroy, OnChanges {
  private readonly ngZone = inject(NgZone);
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  @Input() variant: PixelCardVariant = 'default';
  @Input() gap?: number;
  @Input() speed?: number;
  @Input() colors?: string;
  @Input() noFocus?: boolean;
  @Input() className = '';

  @ViewChild('containerRef', { static: true }) containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('canvasRef', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private pixels: Pixel[] = [];
  private animationRef = 0;
  private previousTime = performance.now();
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initPixels();
      this.resizeObserver = new ResizeObserver(() => this.initPixels());
      this.resizeObserver.observe(this.containerRef.nativeElement);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.containerRef || !this.canvasRef) {
      return;
    }
    if (changes['variant'] || changes['gap'] || changes['speed'] || changes['colors']) {
      this.ngZone.runOutsideAngular(() => this.initPixels());
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationRef);
    this.resizeObserver?.disconnect();
  }

  onMouseEnter(): void {
    this.handleAnimation('appear');
  }

  onMouseLeave(): void {
    this.handleAnimation('disappear');
  }

  onFocus(event: FocusEvent): void {
    if (this.finalNoFocus) {
      return;
    }
    const target = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if (target?.contains(related)) {
      return;
    }
    this.handleAnimation('appear');
  }

  onBlur(event: FocusEvent): void {
    if (this.finalNoFocus) {
      return;
    }
    const target = event.currentTarget as HTMLElement | null;
    const related = event.relatedTarget as Node | null;
    if (target?.contains(related)) {
      return;
    }
    this.handleAnimation('disappear');
  }

  get activeVariantColor(): string | null {
    return this.variantConfig.activeColor;
  }

  get finalNoFocus(): boolean {
    return this.noFocus ?? this.variantConfig.noFocus;
  }

  private get variantConfig(): VariantConfig {
    return VARIANTS[this.variant] ?? VARIANTS['default'];
  }

  private get finalGap(): number {
    return this.gap ?? this.variantConfig.gap;
  }

  private get finalSpeed(): number {
    return this.speed ?? this.variantConfig.speed;
  }

  private get finalColors(): string {
    return this.colors ?? this.variantConfig.colors;
  }

  private initPixels(): void {
    const container = this.containerRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!container || !canvas) {
      return;
    }
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const palette = this.finalColors.split(',');
    const generated: Pixel[] = [];
    const step = Math.max(1, Math.floor(this.finalGap));
    const speed = this.getEffectiveSpeed(this.finalSpeed);

    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = this.reducedMotion ? 0 : distance;
        generated.push(new Pixel(ctx, x, y, color, speed, delay, width, height));
      }
    }

    this.pixels = generated;
  }

  private getEffectiveSpeed(value: number): number {
    const parsed = Math.trunc(value);
    if (parsed <= 0 || this.reducedMotion) {
      return 0;
    }
    if (parsed >= 100) {
      return 0.1;
    }
    return parsed * 0.001;
  }

  private handleAnimation(mode: 'appear' | 'disappear'): void {
    cancelAnimationFrame(this.animationRef);
    this.animationRef = requestAnimationFrame(() => this.animate(mode));
  }

  private animate(mode: 'appear' | 'disappear'): void {
    this.animationRef = requestAnimationFrame(() => this.animate(mode));
    const now = performance.now();
    const delta = now - this.previousTime;
    const frameInterval = 1000 / 60;
    if (delta < frameInterval) {
      return;
    }
    this.previousTime = now - (delta % frameInterval);

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allIdle = true;
    for (const pixel of this.pixels) {
      pixel[mode]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle) {
      cancelAnimationFrame(this.animationRef);
    }
  }
}
