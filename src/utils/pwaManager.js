/**
 * @fileoverview Progressive Web App Manager
 * Comprehensive PWA functionality including service worker management, offline support,
 * install prompts, cache management, and update notifications
 * @author NuwaX
 */

import { PWA_CONFIG, APP_CONFIG } from './config.js';
import { logger } from './logger.js';

/**
 * PWAManager class for comprehensive Progressive Web App functionality
 * Handles service worker registration, offline support, install prompts,
 * cache management, and automatic updates
 */
export class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.serviceWorkerRegistration = null;
    this._pendingReload = false;

    this.init();
  }

  /**
   * Initialize PWA Manager with all features
   */
  async init() {
    if (!PWA_CONFIG.enabled) {
      logger.log('[PWA] PWA features disabled');
      return;
    }

    try {
      await this.registerServiceWorker();
      this.setupOfflineSupport();
      this.setupInstallPrompt();
      this.checkInstallStatus();
      
      logger.log('[PWA] PWA Manager initialized successfully');
    } catch (error) {
      logger.error('[PWA] Failed to initialize PWA Manager:', error);
    }
  }

  /**
   * Register service worker with secure context validation
   */
  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      logger.warn('[PWA] Service Worker not supported');
      return;
    }

    const isSecureContext = location.protocol === 'https:' || 
                           location.hostname === 'localhost' || 
                           location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      logger.warn('[PWA] Service Worker requires HTTPS or localhost. Current protocol:', location.protocol);
      return;
    }

    try {
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('./sw.js', {
        scope: './'
      });
      
      logger.log('[PWA] Service Worker registered successfully');
      
      this.serviceWorkerRegistration.addEventListener('updatefound', () => {
        logger.log('[PWA] Service Worker update found');
        const newWorker = this.serviceWorkerRegistration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.log('[PWA] New Service Worker installed, update available');
              this.showUpdateAvailable();
            }
          });
        }
      });

      // Reload after new SW takes control (triggered by user clicking Reload in notification)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (this._pendingReload) {
          window.location.reload();
        }
      });

    } catch (error) {
      logger.error('[PWA] Service Worker registration failed:', error);
    }
  }

  /**
   * Setup offline support for file protocol and basic functionality
   */
  setupOfflineSupport() {
    const isFileProtocol = location.protocol === 'file:';
    
    if (isFileProtocol) {
      logger.log('[PWA] Running in file:// mode - basic offline support enabled');
      this.setupLocalCache();
      this.setupOfflineResources();
    }
  }

  /**
   * Initialize local cache for offline persistence
   */
  setupLocalCache() {
    const cacheKey = `${PWA_CONFIG.name}_cache`;
    const cacheData = {
      version: APP_CONFIG.version,
      timestamp: Date.now(),
      theme: localStorage.getItem('theme') || 'dark',
      lastUsed: Date.now()
    };
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      logger.log('[PWA] Local cache initialized');
    } catch (error) {
              logger.warn('[PWA] Failed to setup local cache:', error);
    }
  }

  /**
   * Setup offline resource handling with graceful fallbacks
   */
  setupOfflineResources() {
    document.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        logger.warn('[PWA] Image failed to load:', e.target.src);
        e.target.style.display = 'none';
      }
    }, true);
  }

  /**
   * Setup install prompt event listeners
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      logger.log('[PWA] Install prompt triggered');
      this.deferredPrompt = e;
    });

    window.addEventListener('appinstalled', () => {
      logger.log('[PWA] App installed successfully');
      this.isInstalled = true;
      this.deferredPrompt = null;
    });
  }

  /**
   * Check current installation status
   */
  async checkInstallStatus() {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      logger.log('[PWA] Running in standalone mode');
      return;
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      logger.log('[PWA] Service Worker is controlling the page');
    }
  }

  /**
   * Prompt user to install PWA
   * @returns {Promise<boolean>} Installation success status
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      logger.warn('[PWA] Install prompt not available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      logger.log(`[PWA] Install prompt result: ${outcome}`);
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('[PWA] Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Show update available notification
   */
  showUpdateAvailable() {
    logger.log('[PWA] Showing update notification');

    const existing = document.querySelector('.pwa-update-notification');
    if (existing) existing.remove();

    if (!document.querySelector('#pwa-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'pwa-notification-styles';
      style.textContent = [
        '@keyframes pwaSlideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}',
        '.pwa-update-notification{background:var(--bg-tertiary);border:1px solid var(--gray-200);border-left:4px solid var(--teal-500);color:var(--gray-900);box-shadow:0 10px 30px rgba(0,0,0,0.08),0 0 0 1px rgba(46,187,168,0.06);transition:background-color 0.3s,border-color 0.3s,color 0.3s}',
        '.dark .pwa-update-notification{border-color:var(--gray-700);color:white;box-shadow:0 10px 40px rgba(0,0,0,0.4),0 0 0 1px rgba(46,187,168,0.1)}',
        '.pwa-update-icon{background:var(--teal-100);color:var(--teal-600);border-radius:50%;width:2rem;height:2rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background-color 0.3s,color 0.3s}',
        '.dark .pwa-update-icon{background:rgba(22,91,83,0.35);color:var(--teal-400)}',
        '.pwa-subtitle{margin:0.25rem 0 0;font-size:0.75rem;line-height:1.4;color:var(--gray-500);transition:color 0.3s}',
        '.dark .pwa-subtitle{color:var(--gray-400)}',
        '.pwa-reload-btn{background:var(--teal-500);border:none;color:white;padding:0.375rem 0.75rem;border-radius:0.375rem;font-size:0.8125rem;font-weight:600;cursor:pointer;white-space:nowrap;transition:background-color 0.2s}',
        '.pwa-reload-btn:hover{background:var(--teal-600)}',
        '.pwa-dismiss-btn{background:transparent;border:1px solid var(--gray-300);color:var(--gray-500);padding:0.25rem 0.5rem;border-radius:0.375rem;font-size:0.75rem;cursor:pointer;text-align:center;transition:background-color 0.2s,border-color 0.2s,color 0.3s}',
        '.dark .pwa-dismiss-btn{border-color:var(--gray-600);color:var(--gray-400)}',
        '.pwa-dismiss-btn:hover{background:var(--gray-100);border-color:var(--gray-400)}',
        '.dark .pwa-dismiss-btn:hover{background:var(--gray-800);border-color:var(--gray-500)}',
      ].join('');
      document.head.appendChild(style);
    }

    const notification = document.createElement('div');
    notification.className = 'pwa-update-notification';
    notification.style.cssText = [
      'position:fixed', 'bottom:1.5rem', 'right:1.5rem',
      'padding:1rem 1.25rem', 'border-radius:0.75rem',
      'z-index:9999', 'max-width:320px', 'width:calc(100vw - 3rem)',
      'display:flex', 'align-items:center', 'gap:0.75rem',
      'font-family:system-ui,-apple-system,sans-serif',
      'animation:pwaSlideIn 0.3s ease-out',
    ].join(';');

    notification.innerHTML = `
      <div class="pwa-update-icon">
        <svg style="width:1rem;height:1rem" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
      </div>
      <div style="flex:1;min-width:0">
        <p style="margin:0;font-weight:600;font-size:0.875rem;line-height:1.25">Update Available</p>
        <p class="pwa-subtitle">A new version is ready. Reload to apply.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.375rem;flex-shrink:0">
        <button id="pwa-reload-btn" class="pwa-reload-btn">Reload</button>
        <button id="pwa-dismiss-btn" class="pwa-dismiss-btn">Later</button>
      </div>
    `;

    document.body.appendChild(notification);

    document.getElementById('pwa-reload-btn')?.addEventListener('click', () => {
      logger.log('[PWA] User requested update reload');
      notification.style.opacity = '0.6';
      notification.style.pointerEvents = 'none';

      const waiting = this.serviceWorkerRegistration?.waiting;
      if (waiting) {
        this._pendingReload = true;
        waiting.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      logger.log('[PWA] User dismissed update notification');
      notification.remove();
    });

    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, 60000);
  }

  /**
   * Get comprehensive cache status information
   * @returns {Promise<object>} Cache status details
   */
  async getCacheStatus() {
    if (!('serviceWorker' in navigator) || !this.serviceWorkerRegistration) {
      return {
        supported: false,
        active: false,
        caches: [],
        totalSize: 0
      };
    }

    try {
      const messageChannel = new MessageChannel();
      
      const cacheInfo = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Service Worker communication timeout'));
        }, 5000);
        
        messageChannel.port1.onmessage = (event) => {
          clearTimeout(timeout);
          if (event.data.success) {
            resolve(event.data.info);
          } else {
            reject(new Error(event.data.error || 'Failed to get cache info'));
          }
        };
        
        this.serviceWorkerRegistration.active?.postMessage(
          { type: 'GET_CACHE_INFO' },
          [messageChannel.port2]
        );
      });
      
      const cacheNames = await caches.keys();
      const cacheDetails = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            itemCount: keys.length,
            isAppCache: name.includes('nuwault') || name.includes('Nuwault')
          };
        })
      );
      
      return {
        supported: true,
        active: !!this.serviceWorkerRegistration.active,
        serviceWorkerInfo: cacheInfo,
        browserCaches: cacheDetails,
        totalCaches: cacheNames.length,
        appCaches: cacheDetails.filter(cache => cache.isAppCache),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      logger.error('[PWA] Failed to get cache status:', error);
      
      try {
        const cacheNames = await caches.keys();
        return {
          supported: true,
          active: false,
          error: error.message,
          fallbackCaches: cacheNames,
          totalCaches: cacheNames.length,
          timestamp: new Date().toISOString()
        };
      } catch (fallbackError) {
        return {
          supported: false,
          error: fallbackError.message,
          timestamp: new Date().toISOString()
        };
      }
    }
  }

  /**
   * Clear only application-specific caches
   * @returns {Promise<boolean>} Success status
   */
  async clearAppCache() {
    if (!('serviceWorker' in navigator)) {
      logger.warn('[PWA] Service Worker not supported');
      return false;
    }

    try {
      if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
        const messageChannel = new MessageChannel();
        
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Service Worker communication timeout'));
          }, 10000);
          
          messageChannel.port1.onmessage = (event) => {
            clearTimeout(timeout);
            resolve(event.data);
          };
          
          this.serviceWorkerRegistration.active.postMessage(
            { type: 'CLEAR_APP_CACHE' },
            [messageChannel.port2]
          );
        });
        
        logger.log('[PWA] App cache clear result:', result);
        return result.success;
      }
      
      const cacheNames = await caches.keys();
      const appCaches = cacheNames.filter(name => 
        name.includes('nuwault') || name.includes('Nuwault')
      );
      
      await Promise.all(
        appCaches.map(cacheName => caches.delete(cacheName))
      );
      
      logger.log('[PWA] App caches cleared successfully:', appCaches);
      return true;
      
    } catch (error) {
      logger.error('[PWA] Failed to clear app cache:', error);
      return false;
    }
  }

  /**
   * Force cache update through service worker
   * @returns {Promise<boolean>} Success status
   */
  async forceCacheUpdate() {
    if (!('serviceWorker' in navigator)) {
      logger.warn('[PWA] Service Worker not supported');
      return false;
    }

    try {
      if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
        const messageChannel = new MessageChannel();
        
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Service Worker communication timeout'));
          }, 15000);
          
          messageChannel.port1.onmessage = (event) => {
            clearTimeout(timeout);
            resolve(event.data);
          };
          
          this.serviceWorkerRegistration.active.postMessage(
            { type: 'FORCE_UPDATE' },
            [messageChannel.port2]
          );
        });
        
        logger.log('[PWA] Force cache update result:', result);
        return result.success;
      }
      
      return false;
      
    } catch (error) {
      logger.error('[PWA] Failed to force cache update:', error);
      return false;
    }
  }

  /**
   * Clear all caches with timeout and fallback mechanisms
   * @returns {Promise<boolean>} Success status
   */
  async clearCache() {
    if (!('serviceWorker' in navigator)) {
      logger.warn('[PWA] Service Worker not supported');
      return false;
    }

    try {
      if (this.serviceWorkerRegistration && this.serviceWorkerRegistration.active) {
        const messageChannel = new MessageChannel();
        
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            logger.warn('[PWA] Service Worker communication timeout during cache clear');
            reject(new Error('Service Worker communication timeout'));
          }, 2000);
          
          messageChannel.port1.onmessage = (event) => {
            clearTimeout(timeout);
            resolve(event.data.success);
          };
          
          this.serviceWorkerRegistration.active.postMessage(
            { type: 'CLEAR_CACHE' },
            [messageChannel.port2]
          );
        });
        
        logger.log('[PWA] Service Worker cache clear result:', result);
        return result;
      }
      
      logger.log('[PWA] Service Worker not available, clearing caches directly');
      
      const cacheNames = await Promise.race([
        caches.keys(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Cache enumeration timeout')), 1000);
        })
      ]);
      
      const deletePromises = cacheNames.map(async (cacheName) => {
        try {
          await Promise.race([
            caches.delete(cacheName),
            new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Cache delete timeout')), 500);
            })
          ]);
          logger.log('[PWA] Deleted cache:', cacheName);
        } catch (error) {
          logger.warn('[PWA] Failed to delete cache:', cacheName, error.message);
        }
      });
      
      await Promise.allSettled(deletePromises);
      logger.log('[PWA] Cache cleared successfully (direct method)');
      return true;
      
    } catch (error) {
      logger.error('[PWA] Failed to clear cache:', error);
      
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          try {
            await caches.delete(cacheName);
          } catch {
            // Ignore individual cache delete errors
          }
        }
        logger.log('[PWA] Cache cleared with fallback method');
        return true;
      } catch {
        logger.error('[PWA] All cache clear methods failed');
        return false;
      }
    }
  }

  /**
   * Unregister all service workers
   * @returns {Promise<boolean>} Success status
   */
  async unregisterServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        await registration.unregister();
        logger.log('[PWA] Service Worker unregistered');
      }
      
      return true;
    } catch (error) {
      logger.error('[PWA] Failed to unregister Service Worker:', error);
      return false;
    }
  }

  /**
   * Complete PWA reset with cache clearing and service worker unregistration
   */
  async resetPWA() {
    logger.log('[PWA] Resetting PWA...');
    
    await this.clearCache();
    await this.unregisterServiceWorker();
    
    logger.log('[PWA] PWA reset complete. Page will reload.');
    window.location.reload();
  }

  /**
   * Get current PWA installation status
   * @returns {object} Installation status information
   */
  getInstallStatus() {
    return {
      canInstall: !!this.deferredPrompt,
      isInstalled: this.isInstalled,
      pwaEnabled: PWA_CONFIG.enabled,
      serviceWorkerRegistered: !!this.serviceWorkerRegistration,
      serviceWorkerActive: !!(this.serviceWorkerRegistration && this.serviceWorkerRegistration.active)
    };
  }

  /**
   * Get comprehensive development information for debugging
   * @returns {Promise<object>} Development and PWA status information
   */
  async getDevelopmentInfo() {
    const isDev = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';
    
    const basicInfo = {
      isDevelopment: isDev,
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      cacheApiSupported: 'caches' in window,
      timestamp: new Date().toISOString()
    };
    
    try {
      const cacheStatus = await this.getCacheStatus();
      return {
        ...basicInfo,
        cacheStatus,
        installStatus: this.getInstallStatus()
      };
    } catch (error) {
      return {
        ...basicInfo,
        cacheError: error.message
      };
    }
  }

  /**
   * Log detailed PWA status for debugging purposes
   * @returns {Promise<object|null>} Development information or null if failed
   */
  async logPWAStatus() {
    try {
      const devInfo = await this.getDevelopmentInfo();
      
      logger.log('=== PWA Status Debug Information ===');
      logger.log('Environment:', {
        isDevelopment: devInfo.isDevelopment,
        hostname: devInfo.hostname,
        port: devInfo.port,
        protocol: devInfo.protocol
      });
      
      logger.log('PWA Features:', {
        serviceWorkerSupported: devInfo.serviceWorkerSupported,
        cacheApiSupported: devInfo.cacheApiSupported,
        isStandalone: devInfo.isStandalone,
        installStatus: devInfo.installStatus
      });
      
      if (devInfo.cacheStatus) {
        logger.log('Cache Status:', devInfo.cacheStatus);
      }
      
      logger.log('=== End PWA Status ===');
      
      return devInfo;
    } catch (error) {
      logger.error('Failed to get PWA status:', error);
      return null;
    }
  }
} 