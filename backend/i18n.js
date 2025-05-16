const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en', // Default language
    preload: ['en', 'es', 'fr'], // Preload supported languages
    backend: {
      loadPath: path.join(__dirname, '/locales/{{lng}}/translation.json'), // Path to translation files
    },
    detection: {
      order: ['querystring', 'cookie', 'header'], // Detect language from query, cookie, or header
      caches: ['cookie'], // Cache the language in cookies
    },
  });

module.exports = i18next;