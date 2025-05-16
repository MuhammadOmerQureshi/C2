import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en', // Default language
    resources: {
      en: {
        translation: {
          welcome: "Welcome to the system",
          shiftReminder: "Shift Reminder",
          shiftDetails: "Please find your shift details attached."
        }
      },
      es: {
        translation: {
          welcome: "Bienvenido al sistema",
          shiftReminder: "Recordatorio de turno",
          shiftDetails: "Por favor, encuentre los detalles de su turno adjuntos."
        }
      },
      fr: {
        translation: {
          welcome: "Bienvenue dans le système",
          shiftReminder: "Rappel de quart",
          shiftDetails: "Veuillez trouver les détails de votre quart de travail ci-joints."
        }
      }
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie']
    },
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;