export interface FaqItem {
  question: string;
  answer: string;
}

/** Textes affichés dans le hub dossier (Pour qui ?) après choix Client / Avocat */
export const AUDIENCE_CLIENT_BULLETS: string[] = [
  'Échanger avec votre avocat via une messagerie dédiée et confidentielle.',
  'Centraliser les informations utiles sur vos dossiers au même endroit.',
  'Accéder à un espace simple, réservé aux comptes clients.'
];

export const AUDIENCE_AVOCAT_BULLETS: string[] = [
  'Gérer les conversations avec vos clients dans un cadre adapté au secret professionnel.',
  'Structurer le suivi des dossiers et des échanges.',
  'Utiliser un compte avocat distinct des autres rôles (clients, administration).'
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Comment créer un compte ?',
    answer:
      'Rendez-vous sur Inscription, renseignez vos coordonnées et choisissez le type de compte (client ou avocat) selon les options proposées. Vous pourrez ensuite vous connecter depuis la page Connexion.'
  },
  {
    question: 'Mes données sont-elles protégées ?',
    answer:
      'La plateforme est conçue pour des échanges professionnels. Les détails sur les traitements de données figureront dans la politique de confidentialité (page à venir ou déjà disponible depuis le pied de page).'
  },
  {
    question: 'Qui peut accéder à mes messages ?',
    answer:
      'Seuls vous et les personnes autorisées dans le cadre du dossier (par exemple votre conseil) — il n’y a pas d’accès public aux conversations.'
  },
  {
    question: 'Où sont stockées les données ?',
    answer:
      'Les informations précises (hébergement, durée de conservation) seront indiquées dans les mentions légales et la politique de confidentialité, conformément à votre projet.'
  },
  {
    question: 'Comment obtenir de l’aide ?',
    answer:
      'Un canal de contact (e-mail ou formulaire) pourra être ajouté prochainement. En attendant, vous pouvez utiliser les moyens de contact indiqués par votre structure ou votre administrateur.'
  },
  {
    question: 'ForsaLaw remplace-t-il les conseils d’un avocat ?',
    answer:
      'Non. La plateforme facilite les échanges et le suivi des dossiers ; le conseil juridique personnalisé relève toujours de votre avocat.'
  }
];
