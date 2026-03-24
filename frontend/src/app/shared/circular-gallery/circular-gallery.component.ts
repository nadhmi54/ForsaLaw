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
import {
  CircularGalleryApp,
  type CircularGalleryConfig,
  type CircularGalleryItem
} from './circular-gallery.engine';

@Component({
  selector: 'app-circular-gallery',
  standalone: true,
  templateUrl: './circular-gallery.component.html',
  styleUrl: './circular-gallery.component.scss'
})
export class CircularGalleryComponent implements AfterViewInit, OnDestroy {
  private readonly ngZone = inject(NgZone);

  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  @Input() items: CircularGalleryItem[] | null = null;
  @Input() bend = 1;
  @Input() textColor = '#333333';
  @Input() borderRadius = 0.05;
  @Input() font = 'bold 28px Figtree, "Source Sans 3", sans-serif';
  @Input() scrollSpeed = 2;
  @Input() scrollEase = 0.05;

  private app?: CircularGalleryApp;
  private visibilityObserver?: IntersectionObserver;
  /** Évite pause/resume inutiles quand l’IO se redéclenche sans changer de zone visible. */
  private galleryWasInView = false;

  private readonly onDocumentVisibility = (): void => {
    if (document.visibilityState !== 'visible' || !this.app) {
      return;
    }
    const el = this.containerRef.nativeElement;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const inView = r.bottom > 0 && r.top < vh;
    if (inView) {
      this.ngZone.runOutsideAngular(() => this.app?.resume());
    }
  };

  private readonly onPageShow = (e: PageTransitionEvent): void => {
    if (!this.app || !e.persisted) {
      return;
    }
    this.onDocumentVisibility();
  };

  ngAfterViewInit(): void {
    const el = this.containerRef.nativeElement;
    if (!el) {
      return;
    }
    const config: CircularGalleryConfig = {
      items: this.items ?? undefined,
      bend: this.bend,
      textColor: this.textColor,
      borderRadius: this.borderRadius,
      font: this.font,
      scrollSpeed: this.scrollSpeed,
      scrollEase: this.scrollEase
    };
    this.ngZone.runOutsideAngular(() => {
      this.app = new CircularGalleryApp(el, config);

      this.visibilityObserver = new IntersectionObserver(
        (entries) => {
          /* Ne pas exiger intersectionRatio > 0 : certains navigateurs la laissent à 0 au 1er frame */
          const vis = entries.some((e) => e.isIntersecting);
          if (!this.app) {
            return;
          }
          if (vis && !this.galleryWasInView) {
            this.app.resume();
          } else if (!vis && this.galleryWasInView) {
            this.app.pause();
          }
          this.galleryWasInView = vis;
        },
        { root: null, rootMargin: '80px 0px 80px 0px', threshold: 0 }
      );
      this.visibilityObserver.observe(el);

      document.addEventListener('visibilitychange', this.onDocumentVisibility);
      window.addEventListener('pageshow', this.onPageShow);
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('visibilitychange', this.onDocumentVisibility);
    window.removeEventListener('pageshow', this.onPageShow);
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;
    this.ngZone.runOutsideAngular(() => {
      this.app?.destroy();
      this.app = undefined;
    });
  }
}
