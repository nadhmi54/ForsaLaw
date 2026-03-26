import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Present Your Case",
      "subtitle": "Order and Justice through Intelligence.",
      "start_case": "Start a Case",
      "find_lawyer": "Find a Lawyer",
      "nav_home": "High Hall",
      "nav_cases": "Archive of Truth",
      "nav_forum": "Public Square",
      "nav_ai": "Sanctum of Fellawra",
      "nav_lawyer_space": "Counselor's Office",
      "nav_settings": "Control Chamber"
    }
  },
  fr: {
    translation: {
      "welcome": "Présentez Votre Dossier",
      "subtitle": "L'ordre et la justice par l'intelligence.",
      "start_case": "Initier un Dossier",
      "find_lawyer": "Trouver un Avocat",
      "nav_home": "Grand Palais",
      "nav_cases": "Archives de Vérité",
      "nav_forum": "La Place Publique",
      "nav_ai": "Sanctuaire de Fellawra",
      "nav_lawyer_space": "Espace Avocat",
      "nav_settings": "Chambre de Contrôle"
    }
  },
  ar: {
    translation: {
      "welcome": "قدّم قضيتك",
      "subtitle": "النظام والعدالة من خلال الذكاء.",
      "start_case": "بدء قضية",
      "find_lawyer": "البحث عن محامٍ",
      "nav_home": "القاعة الكبرى",
      "nav_cases": "أرشيف الحقيقة",
      "nav_forum": "الساحة العامة",
      "nav_ai": "محراب فيلورا",
      "nav_lawyer_space": "مكتب المحامي",
      "nav_settings": "غرفة التحكم"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Default for Tunisia
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
