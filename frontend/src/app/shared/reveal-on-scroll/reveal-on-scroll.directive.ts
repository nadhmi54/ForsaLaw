import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/** Ajoute la classe `reveal--visible` quand l’élément entre dans le viewport (une fois). */
@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private fallbackTimer?: ReturnType<typeof setTimeout>;
  private fallbackTimer2?: ReturnType<typeof setTimeout>;

  ngAfterViewInit(): void {
    const node = this.el.nativeElement;

    /* Dès que possible : ne pas attendre uniquement l’IO (rechargement / layout). */
    this.applyRevealIfInView();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.reveal(node);
          }
        }
      },
      /**
       * threshold 0.1 + rootMargin négatif : au rechargement, le layout ou le calcul
       * pouvait ne jamais déclencher l’intersection → contenu bloqué en opacity: 0.
       * On utilise threshold 0 et une marge légère pour fiabiliser.
       */
      { threshold: 0, rootMargin: '24px 0px 24px 0px' }
    );
    this.observer.observe(node);

    /* Secours si l’IO ne tire pas (premier frame, fonts, etc.) */
    requestAnimationFrame(() => {
      this.applyRevealIfInView();
      requestAnimationFrame(() => this.applyRevealIfInView());
    });
    this.fallbackTimer = setTimeout(() => this.applyRevealIfInView(), 120);
    this.fallbackTimer2 = setTimeout(() => this.applyRevealIfInView(), 400);
  }

  ngOnDestroy(): void {
    if (this.fallbackTimer !== undefined) {
      clearTimeout(this.fallbackTimer);
    }
    if (this.fallbackTimer2 !== undefined) {
      clearTimeout(this.fallbackTimer2);
    }
    this.observer?.disconnect();
  }

  private reveal(node: HTMLElement): void {
    if (node.classList.contains('reveal--visible')) {
      return;
    }
    node.classList.add('reveal--visible');
    this.observer?.unobserve(node);
  }

  /** Même logique que l’IO : au moins une partie du bloc est dans la fenêtre. */
  private applyRevealIfInView(): void {
    const node = this.el.nativeElement;
    if (node.classList.contains('reveal--visible')) {
      return;
    }
    const rect = node.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const inView =
      rect.bottom > 0 &&
      rect.top < vh &&
      rect.right > 0 &&
      rect.left < vw;
    if (inView) {
      this.reveal(node);
    }
  }
}
