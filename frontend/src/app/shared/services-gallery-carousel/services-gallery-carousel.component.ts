import { Component, Input } from '@angular/core';

/** Même forme que la galerie WebGL — sans dépendance WebGL */
export interface ServicesGallerySlide {
  image: string;
  text: string;
}

@Component({
  selector: 'app-services-gallery-carousel',
  standalone: true,
  templateUrl: './services-gallery-carousel.component.html',
  styleUrl: './services-gallery-carousel.component.scss'
})
export class ServicesGalleryCarouselComponent {
  @Input() items: ServicesGallerySlide[] = [];
}
