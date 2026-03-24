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

@Component({
  selector: 'app-glass-surface',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glass-surface.component.html',
  styleUrl: './glass-surface.component.scss'
})
export class GlassSurfaceComponent implements AfterViewInit, OnDestroy, OnChanges {
  private readonly ngZone = inject(NgZone);

  constructor() {
    const u = crypto.randomUUID().replace(/-/g, '');
    this.filterId = `glass-filter-${u}`;
    this.redGradId = `red-grad-${u}`;
    this.blueGradId = `blue-grad-${u}`;
  }

  @Input() width: number | string = '100%';
  @Input() height: number | string = 'auto';
  @Input() borderRadius = 20;
  @Input() borderWidth = 0.07;
  @Input() brightness = 50;
  @Input() opacity = 0.93;
  @Input() blur = 11;
  @Input() displace = 0;
  @Input() backgroundOpacity = 0;
  @Input() saturation = 1;
  @Input() distortionScale = -180;
  @Input() redOffset = 0;
  @Input() greenOffset = 10;
  @Input() blueOffset = 20;
  @Input() xChannel: 'R' | 'G' | 'B' | 'A' = 'R';
  @Input() yChannel: 'R' | 'G' | 'B' | 'A' = 'G';
  @Input() mixBlendMode = 'difference';
  @Input() className = '';
  /**
   * true = uniquement blur CSS (léger). false = filtre SVG + backdrop-filter url (très coûteux sur la FAQ).
   */
  @Input() lightweight = false;

  @ViewChild('containerRef', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  @ViewChild('feImage') feImageRef?: ElementRef<SVGFEImageElement>;
  @ViewChild('redChannel') redChannelRef?: ElementRef<SVGFEDisplacementMapElement>;
  @ViewChild('greenChannel') greenChannelRef?: ElementRef<SVGFEDisplacementMapElement>;
  @ViewChild('blueChannel') blueChannelRef?: ElementRef<SVGFEDisplacementMapElement>;
  @ViewChild('gaussianBlur') gaussianBlurRef?: ElementRef<SVGFEGaussianBlurElement>;

  filterId = '';
  redGradId = '';
  blueGradId = '';
  svgSupported = false;

  private resizeObserver?: ResizeObserver;
  private viewReady = false;
  private resizeRaf = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.viewReady || !this.containerRef?.nativeElement) {
      return;
    }
    if (this.lightweight || !this.svgSupported) {
      return;
    }
    const keys = [
      'width',
      'height',
      'borderRadius',
      'borderWidth',
      'brightness',
      'opacity',
      'blur',
      'displace',
      'distortionScale',
      'redOffset',
      'greenOffset',
      'blueOffset',
      'xChannel',
      'yChannel',
      'mixBlendMode'
    ];
    if (keys.some((k) => changes[k])) {
      this.scheduleDisplacementUpdate();
    }
  }

  ngAfterViewInit(): void {
    this.svgSupported = this.lightweight ? false : this.supportsSvgFilters();
    this.viewReady = true;

    if (!this.svgSupported) {
      return;
    }
    /* Le SVG est rendu après ce hook (@if) : attendre la micro-tâche pour les ViewChild. */
    queueMicrotask(() => {
      this.scheduleDisplacementUpdate();
      const el = this.containerRef.nativeElement;
      this.resizeObserver = new ResizeObserver(() => {
        this.ngZone.runOutsideAngular(() => this.scheduleDisplacementUpdate());
      });
      this.resizeObserver.observe(el);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.resizeRaf);
    this.resizeObserver?.disconnect();
  }

  /** Regroupe les recalculs SVG sur une seule frame (ResizeObserver + inputs). */
  private scheduleDisplacementUpdate(): void {
    if (!this.svgSupported) {
      return;
    }
    cancelAnimationFrame(this.resizeRaf);
    this.resizeRaf = requestAnimationFrame(() => {
      this.resizeRaf = 0;
      this.ngZone.run(() => this.updateDisplacementMap());
    });
  }

  private supportsSvgFilters(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent;
    const isWebkit = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    if (isWebkit || isFirefox) {
      return false;
    }
    const div = document.createElement('div');
    div.style.backdropFilter = `url(#${this.filterId})`;
    return div.style.backdropFilter !== '';
  }

  private generateDisplacementMap(): string {
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const actualWidth = Math.max(1, Math.round(rect.width));
    const actualHeight = Math.max(1, Math.round(rect.height));
    const edgeSize = Math.min(actualWidth, actualHeight) * (this.borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${this.redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${this.blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${this.borderRadius}" fill="url(#${this.redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${this.borderRadius}" fill="url(#${this.blueGradId})" style="mix-blend-mode: ${this.mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${this.borderRadius}" fill="hsl(0 0% ${this.brightness}% / ${this.opacity})" style="filter:blur(${this.blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }

  updateDisplacementMap(): void {
    const url = this.generateDisplacementMap();
    const img = this.feImageRef?.nativeElement;
    img?.setAttribute('href', url);

    const setDisp = (
      ref: ElementRef<SVGFEDisplacementMapElement> | undefined,
      offset: number
    ) => {
      const el = ref?.nativeElement;
      if (el) {
        el.setAttribute('scale', (this.distortionScale + offset).toString());
        el.setAttribute('xChannelSelector', this.xChannel);
        el.setAttribute('yChannelSelector', this.yChannel);
      }
    };

    setDisp(this.redChannelRef, this.redOffset);
    setDisp(this.greenChannelRef, this.greenOffset);
    setDisp(this.blueChannelRef, this.blueOffset);

    this.gaussianBlurRef?.nativeElement.setAttribute(
      'stdDeviation',
      this.displace.toString()
    );
  }

  get containerStyle(): Record<string, string | number> {
    const w =
      typeof this.width === 'number' ? `${this.width}px` : (this.width as string);
    const h =
      typeof this.height === 'number' ? `${this.height}px` : (this.height as string);
    const base: Record<string, string | number> = {
      width: w,
      height: h,
      borderRadius: `${this.borderRadius}px`,
      '--glass-frost': String(this.backgroundOpacity),
      '--glass-saturation': String(this.saturation)
    };
    if (this.svgSupported) {
      base['--filter-id'] = `url(#${this.filterId})`;
    }
    return base;
  }
}
