import { Component } from '@angular/core';
import { CircularGalleryComponent } from '../../shared/circular-gallery/circular-gallery.component';
import { DecayCardComponent } from '../../shared/decay-card/decay-card.component';
import { FolderRoleHubComponent } from '../../shared/folder-role-hub/folder-role-hub.component';
import { GlassSurfaceComponent } from '../../shared/glass-surface/glass-surface.component';
import { PixelCardComponent } from '../../shared/pixel-card/pixel-card.component';
import { RevealOnScrollDirective } from '../../shared/reveal-on-scroll/reveal-on-scroll.directive';
import {
  AUDIENCE_AVOCAT_BULLETS,
  AUDIENCE_CLIENT_BULLETS,
  FAQ_ITEMS
} from './home-audience-faq.data';
import { SERVICE_CARDS, SERVICE_GALLERY_ITEMS } from './home-services.data';

@Component({
  selector: 'app-home',
  imports: [
    CircularGalleryComponent,
    DecayCardComponent,
    FolderRoleHubComponent,
    GlassSurfaceComponent,
    PixelCardComponent,
    RevealOnScrollDirective
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly serviceCards = SERVICE_CARDS;
  readonly galleryItems = SERVICE_GALLERY_ITEMS;
  readonly clientBullets = AUDIENCE_CLIENT_BULLETS;
  readonly avocatBullets = AUDIENCE_AVOCAT_BULLETS;
  readonly faqItems = FAQ_ITEMS;
  readonly whyChooseLead =
    'Chez ForsaLaw, nous combinons expertise juridique, confidentialite et technologie IA pour vous accompagner de la premiere question jusqu au suivi de votre dossier.';
  readonly whyChooseCards = [
    {
      title: 'Orientation juridique claire',
      description: 'Comprenez rapidement votre situation et les prochaines etapes.',
      image: '/images/why-forsalaw/orientation-juridique.png'
    },
    {
      title: 'Confidentialite et securite',
      description: 'Vos echanges et documents restent proteges a chaque etape.',
      image: '/images/why-forsalaw/confidentialite-securite.png'
    },
    {
      title: 'Mise en relation ciblee',
      description: 'Nous vous orientons vers l avocat le plus pertinent selon votre besoin.',
      image: '/images/why-forsalaw/mise-en-relation.png'
    },
    {
      title: 'Suivi simplifie des dossiers',
      description: 'Centralisez vos messages, pieces et rendez-vous sur une seule plateforme.',
      image: '/images/why-forsalaw/suivi-dossiers.png'
    },
    {
      title: 'Agent IA 3D',
      description:
        'Posez vos questions a notre agent IA 3D, obtenez des reponses rapides et soyez guide vers les avocats adaptes a votre situation.',
      image: '/images/why-forsalaw/agent-ia-3d.png'
    }
  ] as const;
  readonly guarantees = [
    {
      title: 'Confidentialite',
      description:
        'Les echanges entre avocat et client restent strictement confidentiels, avec un espace securise adapte aux dossiers sensibles.',
      image: '/images/guarantees/confidentialite.png',
      imageAlt: 'Illustration de confidentialite juridique',
      variant: 'blue'
    },
    {
      title: 'Securite des donnees',
      description:
        'Vos documents, messages et informations juridiques sont proteges par une infrastructure fiable et des controles d acces renforces.',
      image: '/images/guarantees/securite-donnees.png',
      imageAlt: 'Illustration de securite des donnees',
      variant: 'yellow'
    },
    {
      title: 'Accompagnement humain',
      description:
        'Clients et avocats sont accompagnes a chaque etape, de l inscription a la gestion des dossiers et au suivi des echanges.',
      image: '/images/guarantees/accompagnement-humain.png',
      imageAlt: 'Illustration d accompagnement humain',
      variant: 'pink'
    }
  ] as const;
}
