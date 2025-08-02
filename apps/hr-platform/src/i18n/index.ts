import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files from local directory
import commonEN from './locales/en/common.json';
import commonTR from './locales/tr/common.json';
import questionsEN from './locales/en/questions.json';
import questionsTR from './locales/tr/questions.json';
import uiEN from './locales/en/ui.json';
import uiTR from './locales/tr/ui.json';

const resources = {
  en: {
    common: commonEN,
    questions: questionsEN,
    ui: uiEN,
  },
  tr: {
    common: commonTR,
    questions: questionsTR,
    ui: uiTR,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    debug: process.env.NODE_ENV === 'development',

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n; 