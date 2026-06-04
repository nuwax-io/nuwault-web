/**
 * @fileoverview Theme Management Utility
 * Provides theme switching functionality with system preference detection
 * Supports light, dark, and system themes with environment configuration
 * @author NuwaX
 */

import { UI_CONFIG } from './config.js';

/**
 * Available theme options
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

/**
 * Validate theme value against available options
 * @param {string} theme - Theme to validate
 * @returns {boolean} True if theme is valid
 */
const isValidTheme = (theme) => {
  return Object.values(THEMES).includes(theme);
};

/**
 * Get system theme preference from media query
 * @returns {string} System theme preference (light or dark)
 */
export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
};

/**
 * Get current theme from localStorage with fallback hierarchy
 * Priority: localStorage > environment config > system preference
 * @returns {string} Current theme setting
 */
export const getStoredTheme = () => {
  const stored = localStorage.getItem('theme');
  const defaultTheme = UI_CONFIG.defaultTheme;
  
  if (stored && isValidTheme(stored)) {
    return stored;
  }
  
  if (defaultTheme && isValidTheme(defaultTheme)) {
    return defaultTheme;
  }
  
  return THEMES.SYSTEM;
};

/**
 * Apply theme to document root element
 * @param {string} theme - Theme to apply
 */
export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  if (theme === THEMES.SYSTEM) {
    const systemTheme = getSystemTheme();
    root.classList.remove('dark', 'light');
    root.classList.add(systemTheme);
  } else {
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }
};

/**
 * Set theme and persist to localStorage
 * @param {string} theme - Theme to set and save
 */
export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  applyTheme(theme);
};

/**
 * Initialize theme system on application load
 * Sets up theme persistence and system preference monitoring
 */
export const initializeTheme = () => {
  if (!localStorage.getItem('theme') && UI_CONFIG.defaultTheme && isValidTheme(UI_CONFIG.defaultTheme)) {
    localStorage.setItem('theme', UI_CONFIG.defaultTheme);
  }
  
  const storedTheme = getStoredTheme();
  applyTheme(storedTheme);
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const currentTheme = getStoredTheme();
    if (currentTheme === THEMES.SYSTEM) {
      applyTheme(THEMES.SYSTEM);
    }
  });
}; 