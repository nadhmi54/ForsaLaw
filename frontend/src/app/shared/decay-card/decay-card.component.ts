import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-decay-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './decay-card.component.html',
  styleUrl: './decay-card.component.scss'
})
export class DecayCardComponent implements AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @Input() width: number | string = '100%';
  @Input() height: number | string = 360;
  @Input() image = 'https://picsum.photos/300/400?grayscale';
  @Input() intensity = 1;

  @ViewChild('contentRef', { static: true }) contentRef!: ElementRef<HTMLDivElement>;
  @ViewChild('displacementMapRef', { static: true })
  displacementMapRef!: ElementRef<SVGFEDisplacementMapElement>;

  private cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  private cachedCursor = { ...this.cursor };
  private winsize = { width: window.innerWidth, height: window.innerHeight };
  private imgTransforms = { x: 0, y: 0, rz: 0 };
  private displacementScale = 0;
  private animationFrame = 0;
  private readonly onResize = () => {
    this.winsize = { width: window.innerWidth, height: window.innerHeight };
  };
  private readonly onMouseMove = (ev: MouseEvent) => {
    this.cursor = { x: ev.clientX, y: ev.clientY };
  };

  readonly filterId = `imgFilter-${crypto.randomUUID().replace(/-/g, '')}`;

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('resize', this.onResize, { passive: true });
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      this.render();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    cancelAnimationFrame(this.animationFrame);
  }

  get containerStyle(): Record<string, string> {
    const width = typeof this.width === 'number' ? `${this.width}px` : this.width;
    const height = typeof this.height === 'number' ? `${this.height}px` : this.height;
    return { width, height };
  }

  private render(): void {
    const targetX = this.boundLerp(
      this.mapRange(this.cursor.x, 0, this.winsize.width, -120, 120) * this.intensity,
      this.imgTransforms.x
    );
    const targetY = this.boundLerp(
      this.mapRange(this.cursor.y, 0, this.winsize.height, -120, 120) * this.intensity,
      this.imgTransforms.y
    );
    const targetRz = this.lerp(
      this.imgTransforms.rz,
      this.mapRange(this.cursor.x, 0, this.winsize.width, -10, 10) * this.intensity,
      0.1
    );

    this.imgTransforms.x = targetX;
    this.imgTransforms.y = targetY;
    this.imgTransforms.rz = targetRz;
    this.contentRef.nativeElement.style.transform =
      `translate3d(${targetX}px, ${targetY}px, 0) rotateZ(${targetRz}deg)`;

    const cursorTravelledDistance = this.distance(
      this.cachedCursor.x,
      this.cursor.x,
      this.cachedCursor.y,
      this.cursor.y
    );

    this.displacementScale = this.lerp(
      this.displacementScale,
      this.mapRange(cursorTravelledDistance, 0, 200, 0, 400) * this.intensity,
      0.06
    );

    this.displacementMapRef.nativeElement.setAttribute('scale', `${this.displacementScale}`);
    this.cachedCursor = { ...this.cursor };
    this.animationFrame = requestAnimationFrame(() => this.render());
  }

  private lerp(a: number, b: number, n: number): number {
    return (1 - n) * a + n * b;
  }

  private mapRange(x: number, a: number, b: number, c: number, d: number): number {
    return ((x - a) * (d - c)) / (b - a) + c;
  }

  private distance(x1: number, x2: number, y1: number, y2: number): number {
    return Math.hypot(x1 - x2, y1 - y2);
  }

  private boundLerp(mappedValue: number, current: number): number {
    let target = this.lerp(current, mappedValue, 0.1);
    const bound = 50;
    if (target > bound) {
      target = bound + (target - bound) * 0.2;
    } else if (target < -bound) {
      target = -bound + (target + bound) * 0.2;
    }
    return target;
  }
}
