import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface GooeyNavItem {
  label: string;
  /** Chemin Angular, ex. `/home` */
  href: string;
}

@Component({
  selector: 'app-gooey-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './gooey-nav.component.html',
  styleUrl: './gooey-nav.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class GooeyNavComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);

  @Input({ required: true }) items: GooeyNavItem[] = [];

  @Input() animationTime = 600;
  @Input() particleCount = 15;
  @Input() particleDistances: [number, number] = [90, 10];
  @Input() particleR = 100;
  @Input() timeVariance = 300;
  @Input() colors: number[] = [1, 2, 3, 1, 2, 3, 1, 4];

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('navList') navRef!: ElementRef<HTMLUListElement>;
  @ViewChild('filter') filterRef!: ElementRef<HTMLSpanElement>;
  @ViewChild('text') textRef!: ElementRef<HTMLSpanElement>;

  readonly activeIndex = signal(0);
  private resizeObserver?: ResizeObserver;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((e) => {
        const idx = this.urlToIndex(e.urlAfterRedirects);
        if (idx !== this.activeIndex()) {
          this.activeIndex.set(idx);
          queueMicrotask(() => this.syncEffectFromRoute());
        }
      });
  }

  ngAfterViewInit(): void {
    const idx = this.urlToIndex(this.router.url);
    this.activeIndex.set(idx);
    queueMicrotask(() => {
      if (idx < 0) {
        this.clearEffect();
      } else {
        this.syncEffectFromRoute();
        this.textRef?.nativeElement.classList.add('active');
      }
    });

    if (this.containerRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        const i = this.activeIndex();
        if (i < 0) {
          return;
        }
        const lis = this.navRef?.nativeElement?.querySelectorAll('li');
        const li = lis?.[i];
        const anchor = li?.querySelector('a');
        if (anchor) {
          this.updateEffectPosition(anchor as HTMLElement);
        }
      });
      this.resizeObserver.observe(this.containerRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /** Index de l’item dont le href correspond à l’URL, ou -1 si aucun (ex. bloc gauche sur /connexion). */
  private urlToIndex(url: string): number {
    let path = this.normalizeUrlPath(url);
    if (path === '/') {
      path = '/home';
    }
    for (let i = 0; i < this.items.length; i++) {
      const href = this.normalizeUrlPath(this.items[i].href);
      if (path === href) {
        return i;
      }
    }
    return -1;
  }

  private normalizeUrlPath(fullUrl: string): string {
    let path = fullUrl.split('?')[0].split('#')[0].trim();
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    path = path.replace(/\/+$/, '') || '/';
    return path;
  }

  private clearEffect(): void {
    const filter = this.filterRef?.nativeElement;
    const text = this.textRef?.nativeElement;
    filter?.querySelectorAll('.particle').forEach((p) => p.remove());
    if (filter) {
      filter.style.opacity = '0';
    }
    if (text) {
      text.style.opacity = '0';
      text.classList.remove('active');
    }
  }

  private syncEffectFromRoute(): void {
    const idx = this.activeIndex();
    if (idx < 0) {
      this.clearEffect();
      return;
    }
    const lis = this.navRef?.nativeElement?.querySelectorAll('li');
    const li = lis?.[idx];
    const anchor = li?.querySelector('a') as HTMLElement | undefined;
    if (anchor) {
      this.updateEffectPosition(anchor);
    }
    this.textRef?.nativeElement.classList.add('active');
  }

  private noise(n = 1): number {
    return n / 2 - Math.random() * n;
  }

  private getXY(distance: number, pointIndex: number, totalPoints: number): [number, number] {
    const angle = ((360 + this.noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  }

  private createParticle(
    i: number,
    t: number,
    d: [number, number],
    r: number
  ): {
    start: [number, number];
    end: [number, number];
    time: number;
    scale: number;
    color: number;
    rotate: number;
  } {
    const rotate = this.noise(r / 10);
    return {
      start: this.getXY(d[0], this.particleCount - i, this.particleCount),
      end: this.getXY(d[1] + this.noise(7), this.particleCount - i, this.particleCount),
      time: t,
      scale: 1 + this.noise(0.2),
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  }

  private makeParticles(element: HTMLElement): void {
    const d = this.particleDistances;
    const r = this.particleR;
    const bubbleTime = this.animationTime * 2 + this.timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < this.particleCount; i++) {
      const t = this.animationTime * 2 + this.noise(this.timeVariance * 2);
      const p = this.createParticle(i, t, d, r);
      element.classList.remove('active');

      window.setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        window.setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            /* ignore */
          }
        }, t);
      }, 30);
    }
  }

  private updateEffectPosition(element: HTMLElement): void {
    const container = this.containerRef?.nativeElement;
    const filter = this.filterRef?.nativeElement;
    const text = this.textRef?.nativeElement;
    if (!container || !filter || !text) {
      return;
    }
    const containerRect = container.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    filter.style.opacity = '1';
    text.style.opacity = '1';
    Object.assign(filter.style, styles);
    Object.assign(text.style, styles);
    text.innerText = element.innerText;
  }

  onClick(event: MouseEvent, index: number): void {
    const anchor = event.currentTarget as HTMLElement;
    if (this.activeIndex() === index) {
      return;
    }
    this.activeIndex.set(index);
    this.updateEffectPosition(anchor);

    const filter = this.filterRef?.nativeElement;
    if (filter) {
      filter.querySelectorAll('.particle').forEach((p) => p.remove());
    }

    const text = this.textRef?.nativeElement;
    if (text) {
      text.classList.remove('active');
      void text.offsetWidth;
      text.classList.add('active');
    }

    if (filter) {
      this.makeParticles(filter);
    }
  }
}
