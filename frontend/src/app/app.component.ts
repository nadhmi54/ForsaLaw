import { Component, HostListener, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { GooeyNavComponent, GooeyNavItem } from './shared/gooey-nav/gooey-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, GooeyNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly currentYear = new Date().getFullYear();

  /** Connexion / inscription : uniquement la barre du haut + formulaire (pas de bandeau ni footer) */
  readonly isAuthPage = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.isAuthUrl(this.router.url))
    ),
    { initialValue: this.isAuthUrl(this.router.url) }
  );

  /** 0 = premier bandeau uniquement, 1 = deuxième bandeau uniquement (remplace le premier) */
  readonly headerPanel = signal<0 | 1>(0);

  readonly gooeyNavLeftItems: GooeyNavItem[] = [{ label: 'Accueil', href: '/home' }];

  readonly gooeyNavRightItems: GooeyNavItem[] = [
    { label: 'Connexion', href: '/connexion' },
    { label: 'Inscription', href: '/inscription' }
  ];

  readonly particleDistances: [number, number] = [90, 10];
  readonly gooeyColors = [1, 2, 3, 1, 2, 3, 1, 4];

  /** Même format typographique que le deuxième (citation, italique) */
  readonly primaryHeaderText =
    'Bienvenue sur ForsaLaw — votre espace pour échanger en toute sécurité entre avocats et clients.';

  readonly sloganHeaderText =
    "S'il n'y avait pas de mauvaises personnes, il n'y aurait pas de bons avocats.";
  readonly showBackToTop = signal(false);

  goToPreviousHeader(): void {
    this.headerPanel.set(0);
  }

  goToNextHeader(): void {
    this.headerPanel.set(1);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackToTop.set(window.scrollY > 280);
  }

  private isAuthUrl(url: string): boolean {
    const path = url.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
    return path === '/connexion' || path === '/inscription';
  }
}
