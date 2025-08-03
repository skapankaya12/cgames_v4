/// <reference types="vite/client" />

declare global {
  interface Window {
    i18n?: {
      changeLanguage: (language: string) => void;
    };
    i18next?: {
      language: string;
    };
  }
}

export {};
