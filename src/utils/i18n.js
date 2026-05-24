/**
 * @fileoverview Internationalization (i18n) Configuration Manager
 * Provides comprehensive language support with automatic detection, preference management,
 * and utilities for translations, number formatting, and date formatting
 * @author NuwaX
 */

import i18next from 'i18next';
import enTranslations from '../locales/en/translations.json';
import trTranslations from '../locales/tr/translations.json';

/**
 * Supported languages configuration with metadata
 */
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="20" height="20">
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#t)" stroke="#cf142b" stroke-width="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" stroke-width="6"/>
    </svg>`
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="20" height="20">
      <rect width="1200" height="800" fill="#E30A17"/>
      <circle cx="425" cy="400" r="200" fill="#ffffff"/>
      <circle cx="475" cy="400" r="160" fill="#E30A17"/>
      <path d="M583.334 400l177.735 57.777-109.881-150.885v186.216l109.881-150.885z" fill="#ffffff"/>
    </svg>`
  }
};

export const DEFAULT_LANGUAGE = 'en';
export const FALLBACK_LANGUAGE = 'en';

/**
 * Smart language detection with priority order
 * 1. User's saved preference (localStorage)
 * 2. Browser language detection
 * 3. Default language fallback
 * @returns {string} Detected language code
 */
export const detectLanguage = () => {
  const savedLanguage = localStorage.getItem('nuwault-language');
  if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
    return savedLanguage;
  }

  const browserLanguage = navigator.language || navigator.languages?.[0];
  if (browserLanguage) {
    const langCode = browserLanguage.split('-')[0].toLowerCase();
    if (SUPPORTED_LANGUAGES[langCode]) {
      return langCode;
    }
  }

  return DEFAULT_LANGUAGE;
};

/**
 * Persist language preference to localStorage
 * @param {string} language - Language code to save
 */
export const saveLanguagePreference = (language) => {
  if (SUPPORTED_LANGUAGES[language]) {
    localStorage.setItem('nuwault-language', language);
  }
};

/**
 * Initialize i18next with detected language and configuration
 * @returns {Promise<i18next>} Configured i18next instance
 */
export const initI18n = async () => {
  const detectedLanguage = detectLanguage();

  await i18next.init({
    lng: detectedLanguage,
    fallbackLng: FALLBACK_LANGUAGE,
    debug: import.meta.env.MODE === 'development',
    
    defaultNS: 'translations',
    ns: ['translations'],
    
    resources: {
      en: {
        translations: enTranslations
      },
      tr: {
        translations: trTranslations
      }
    },

    interpolation: {
      escapeValue: false
    }
  });

  return i18next;
};

/**
 * Change application language with validation and event dispatch
 * @param {string} language - Target language code
 * @returns {Promise<boolean>} Success status
 */
export const changeLanguage = async (language) => {
  if (!SUPPORTED_LANGUAGES[language]) {
    console.warn(`[i18n] Unsupported language: ${language}`);
    return false;
  }

  try {
    await i18next.changeLanguage(language);
    saveLanguagePreference(language);
    
    document.documentElement.lang = language;
    
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language, languageInfo: SUPPORTED_LANGUAGES[language] } 
    }));
    
    return true;
  } catch (error) {
    console.error('[i18n] Error changing language:', error);
    return false;
  }
};

/**
 * Translation helper function
 * @param {string} key - Translation key
 * @param {object} options - Translation options
 * @returns {string} Translated text
 */
export const t = (key, options = {}) => {
  return i18next.t(key, options);
};

/**
 * Get current active language code
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => {
  return i18next.language || DEFAULT_LANGUAGE;
};

/**
 * Get current language metadata
 * @returns {object} Language information object
 */
export const getCurrentLanguageInfo = () => {
  const currentLang = getCurrentLanguage();
  return SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
};

/**
 * Check if language uses right-to-left text direction
 * @param {string|null} language - Language code (defaults to current)
 * @returns {boolean} True if RTL language
 */
export const isRTL = (language = null) => {
  const lang = language || getCurrentLanguage();
  const rtlLanguages = ['ar', 'he', 'fa'];
  return rtlLanguages.includes(lang);
};

/**
 * Format number using current locale
 * @param {number} number - Number to format
 * @param {object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export const formatNumber = (number, options = {}) => {
  const currentLang = getCurrentLanguage();
  return new Intl.NumberFormat(currentLang, options).format(number);
};

/**
 * Format date using current locale
 * @param {Date|string|number} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {}) => {
  const currentLang = getCurrentLanguage();
  return new Intl.DateTimeFormat(currentLang, options).format(date);
};

export default i18next; 