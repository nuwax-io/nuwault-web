/**
 * @fileoverview PWA Manifest Manager
 * Dynamically manages PWA manifest links and meta tags based on configuration
 * Handles PWA-specific HTML elements, iOS icons, and theme color management
 * @author NuwaX
 */

import { PWA_CONFIG } from './config.js';
import { logger } from './logger.js';

/**
 * ManifestManager class for dynamic PWA manifest and meta tag management
 * Automatically adds/removes PWA-related HTML elements based on configuration
 */
export class ManifestManager {
  constructor() {
    this.init();
  }

  /**
   * Initialize manifest management based on PWA configuration
   */
  init() {
    if (PWA_CONFIG.enabled) {
      this.addManifestLink();
      this.addPWAMetaTags();
      logger.log('[Manifest] PWA manifest and meta tags added');
    } else {
      this.removeManifestLink();
      this.removePWAMetaTags();
      logger.log('[Manifest] PWA manifest and meta tags removed');
    }
  }

  /**
   * Add PWA manifest link to document head
   */
  addManifestLink() {
    if (document.querySelector('link[rel="manifest"]')) {
      return;
    }

    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = './manifest.json';
    document.head.appendChild(manifestLink);
  }

  /**
   * Remove PWA manifest link from document head
   */
  removeManifestLink() {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.remove();
    }
  }

  /**
   * Add comprehensive PWA meta tags and iOS icons
   */
  addPWAMetaTags() {
    this.addMetaTag('theme-color', PWA_CONFIG.themeColor);
    this.addMetaTag('apple-mobile-web-app-capable', 'yes');
    this.addMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    this.addMetaTag('apple-mobile-web-app-title', PWA_CONFIG.shortName);
    this.addMetaTag('msapplication-TileColor', PWA_CONFIG.themeColor);
    this.addMetaTag('msapplication-tap-highlight', 'no');

    this.addAppleTouchIcon('152x152', './assets/img/icons/nuwault_icon_152x152.png');
    this.addAppleTouchIcon('180x180', './assets/img/icons/nuwault_icon_180x180.png');
  }

  /**
   * Remove all PWA-specific meta tags and icons
   */
  removePWAMetaTags() {
    const pwaMetaTags = [
      'meta[name="theme-color"]',
      'meta[name="apple-mobile-web-app-capable"]',
      'meta[name="apple-mobile-web-app-status-bar-style"]',
      'meta[name="apple-mobile-web-app-title"]',
      'meta[name="msapplication-TileColor"]',
      'meta[name="msapplication-tap-highlight"]',
      'link[rel="apple-touch-icon"]'
    ];

    pwaMetaTags.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => element.remove());
    });
  }

  /**
   * Add meta tag with duplicate prevention
   * @param {string} name - Meta tag name
   * @param {string} content - Meta tag content
   */
  addMetaTag(name, content) {
    if (document.querySelector(`meta[name="${name}"]`)) {
      return;
    }

    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  }

  /**
   * Add Apple Touch Icon with duplicate prevention
   * @param {string} sizes - Icon sizes attribute
   * @param {string} href - Icon file path
   */
  addAppleTouchIcon(sizes, href) {
    if (document.querySelector(`link[rel="apple-touch-icon"][sizes="${sizes}"]`)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'apple-touch-icon';
    link.sizes = sizes;
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Get current manifest management status
   * @returns {object} Status information
   */
  getStatus() {
    return {
      manifestLinked: !!document.querySelector('link[rel="manifest"]'),
      pwaEnabled: PWA_CONFIG.enabled,
      metaTagsCount: document.querySelectorAll('meta[name*="apple-mobile-web-app"], meta[name*="msapplication"], meta[name="theme-color"], meta[name="background-color"]').length
    };
  }
} 