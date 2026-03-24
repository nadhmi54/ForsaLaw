import type { CircularGalleryItem } from '../../shared/circular-gallery/circular-gallery.engine';

/**
 * Visuels du carrousel « Nous vous proposons » — fichiers dans `public/images/services/`
 * (servis à l’URL `/images/services/...`). Remplacez les JPG par vos propres visuels.
 */
const GALLERY_TEXTURES = {
  contentieux: '/images/services/contentieux.jpg',
  notreApproche: '/images/services/notre-approche.jpg',
  reglesDeBase: '/images/services/regles-de-base.jpg',
  clientelePrivee: '/images/services/clientele-privee.jpg'
} as const;

/** Cartes « Nous vous proposons » — champ `image` réservé pour d’éventuels visuels */
export interface ServiceCard {
  image: string;
  title: string;
  description: string;
}

/** Même contenu que les cartes, pour la galerie WebGL (image + libellé sous chaque plan) */
export const SERVICE_GALLERY_ITEMS: CircularGalleryItem[] = [
  { image: GALLERY_TEXTURES.contentieux, text: 'CONTENTIEUX' },
  { image: GALLERY_TEXTURES.notreApproche, text: 'NOTRE APPROCHE' },
  { image: GALLERY_TEXTURES.reglesDeBase, text: 'RÈGLES DE BASE' },
  { image: GALLERY_TEXTURES.clientelePrivee, text: 'CLIENTÈLE PRIVÉE' }
];

export const SERVICE_CARDS: ServiceCard[] = [
  {
    image: GALLERY_TEXTURES.contentieux,
    title: 'Contentieux',
    description:
      'Accompagnement sur les litiges et les procédures, avec une analyse adaptée à votre situation et une représentation devant les juridictions.'
  },
  {
    image: GALLERY_TEXTURES.notreApproche,
    title: 'Notre approche',
    description:
      'Un échange clair dès le premier rendez-vous : méthode structurée, transparence et stratégie alignée sur vos objectifs.'
  },
  {
    image: GALLERY_TEXTURES.reglesDeBase,
    title: 'Règles de base',
    description:
      'Respect du cadre déontologique et des obligations réciproques pour des échanges sécurisés, entre professionnels et avec vous.'
  },
  {
    image: GALLERY_TEXTURES.clientelePrivee,
    title: 'Clientèle privée',
    description:
      'Un accompagnement sur mesure pour les particuliers : écoute, confidentialité et suivi attentif de vos dossiers sensibles.'
  }
];
