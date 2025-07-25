import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import ar from './locales/ar.json';
import ber from './locales/ber.json';

const resources = {
  en: {
    translation: en
  },
  fr: {
    translation: fr
  },
  es: {
    translation: es
  },
  ar: {
    translation: ar
  },
  ber: {
    translation: ber
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n; 