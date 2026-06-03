/**
 * Service Worker for Progressive Web App
 * Provides offline functionality, caching strategies, and background sync
 * @version {{APP_VERSION}}
 */

const CACHE_NAME = '{{APP_NAME}}-v{{APP_VERSION}}';
const CACHE_VERSION = '{{APP_VERSION}}';
const APP_NAME = '{{APP_NAME}}';

/**
 * Cache Management Configuration
 * Controls cache lifecycle and cleanup behavior
 */
const CACHE_CONFIG = {
  // Maximum number of caches to keep (for cleanup)
  MAX_CACHES: 5,
  // Prefix for identifying app caches
  CACHE_PREFIX: APP_NAME + '-v',
  // Version for comparing cache ages
  CURRENT_VERSION: CACHE_VERSION
};

/**
 * Enhanced Logger for Service Worker
 * Provides consistent logging with development/production awareness
 */
class Logger {
  constructor() {
    // Detect if we're in development mode
    this.isDevelopment = this.detectDevelopment();
    this.prefix = '[SW]';
  }
  
  /**
   * Detects development environment
   * @returns {boolean} True if in development mode
   */
  detectDevelopment() {
    // Multiple ways to detect development
    return (
      // Local development - only dev server, NOT preview
      self.location.hostname === 'localhost' && self.location.port === '5173' ||
      self.location.hostname === '127.0.0.1' && self.location.port === '5173' ||
      self.location.protocol === 'file:'
    );
  }
  
  log(...args) {
    if (this.isDevelopment) {
      console.log(this.prefix, ...args);
    }
  }
  
  info(...args) {
    if (this.isDevelopment) {
      console.info(this.prefix, ...args);
    }
  }
  
  warn(...args) {
    if (this.isDevelopment) {
      console.warn(this.prefix, ...args);
    }
  }
  
  error(...args) {
    // Always show errors, even in production
    console.error(this.prefix, ...args);
  }
  
  debug(...args) {
    if (this.isDevelopment) {
      console.debug(this.prefix, ...args);
    }
  }
  
  group(title) {
    if (this.isDevelopment) {
      console.group(this.prefix + ' ' + title);
    }
  }
  
  groupEnd() {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

// Create logger instance
const logger = new Logger();

// Detect development environment - only dev server (5173), NOT preview (4173)
const isDevelopment = (self.location.hostname === 'localhost' && self.location.port === '5173') ||
                     (self.location.hostname === '127.0.0.1' && self.location.port === '5173') ||
                     self.location.protocol === 'file:';

/**
 * Static Cache URLs
 * Core application files for offline functionality
 */
const STATIC_CACHE_URLS = [
  // Core files
  '/',
  '/index.html',
  '/manifest.json',
  '/redirect.js',
  
  // Icons - all sizes for PWA compatibility (verified to exist)
  '/assets/img/icons/nuwault_icon_16x16.png',
  '/assets/img/icons/nuwault_icon_32x32.png',
  '/assets/img/icons/nuwault_icon_48x48.png',
  '/assets/img/icons/nuwault_icon_72x72.png',
  '/assets/img/icons/nuwault_icon_96x96.png',
  '/assets/img/icons/nuwault_icon_128x128.png',
  '/assets/img/icons/nuwault_icon_144x144.png',
  '/assets/img/icons/nuwault_icon_152x152.png',
  '/assets/img/icons/nuwault_icon_180x180.png',
  '/assets/img/icons/nuwault_icon_192x192.png',
  '/assets/img/icons/nuwault_icon_384x384.png',
  '/assets/img/icons/nuwault_icon_512x512.png',
  
  // Favicon files (verified to exist)
  '/assets/img/favicon/favicon-96x96.png',
  '/assets/img/favicon/favicon.svg',
  '/assets/img/favicon/favicon.ico',
  '/assets/img/favicon/apple-touch-icon.png',
  '/assets/img/favicon/web-app-manifest-192x192.png',
  '/assets/img/favicon/web-app-manifest-512x512.png',
  
  // Logo files (verified to exist)
  '/assets/img/logo/nuwault_logo_horizontal_dark_360px.png',
  '/assets/img/logo/nuwault_logo_horizontal_light_360px.png',
  '/assets/img/logo/nuwault_logo_symbol.svg'
];

/**
 * Dynamic Cache Patterns
 * File patterns for automatic caching
 */
const DYNAMIC_CACHE_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/
];

/**
 * Development Exclusion Patterns
 * Patterns to exclude from caching in development
 */
const DEV_EXCLUDE_PATTERNS = [
  /@vite\/client/,
  /@react-refresh/,
  /\.hot-update\./,
  /\/src\//,
  /\?t=\d+/,  // Vite timestamp queries
  /\?import/,  // Vite import queries
  /favicon\.ico/ // Skip favicon in dev to reduce noise
];

// Create a clean development offline page
const DEV_OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dev Server Offline - {{APP_NAME}}</title>
  <style>
    /* Inline basic styles to avoid external dependencies */
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      font-family: system-ui, -apple-system, sans-serif; 
      background: #0d1425; 
      color: white; 
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      padding: 16px;
    }
    .container { max-width: 400px; width: 100%; text-align: center; }
    .icon { 
      width: 96px; 
      height: 96px; 
      background: linear-gradient(135deg, #2ebba8 0%, #26a69a 100%); 
      margin: 0 auto 32px; 
      border-radius: 16px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      animation: bounce 1s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(-25%); }
      50% { transform: none; }
    }
    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    h1 { font-size: 32px; margin: 0 0 8px; }
    .subtitle { color: #9ca3af; font-size: 18px; margin-bottom: 32px; }
    .status-card { background: #1a2332; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
    .status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .status-row:last-child { margin-bottom: 0; }
    .status-offline { 
      background: #fee2e2; 
      color: #dc2626; 
      padding: 4px 8px; 
      border-radius: 12px; 
      font-size: 12px; 
      display: inline-flex; 
      align-items: center;
    }
    .status-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; margin-right: 6px; }
    .code { background: #242e3f; color: #2ebba8; padding: 12px; border-radius: 4px; font-family: monospace; }
    .btn { 
      width: 100%; 
      padding: 12px; 
      border: none; 
      border-radius: 8px; 
      font-weight: 600; 
      cursor: pointer; 
      margin-bottom: 12px;
      transition: all 0.2s;
    }
    .btn-primary { background: #2ebba8; color: white; }
    .btn-primary:hover { background: #26a69a; }
    .btn-secondary { background: #374151; color: white; }
    .btn-secondary:hover { background: #4b5563; }
    .footer { font-size: 12px; color: #6b7280; margin-top: 24px; }
    .instruction { background: #2ebba820; border: 1px solid #2ebba8; padding: 16px; border-radius: 8px; margin-bottom: 16px; }
    .instruction h3 { margin: 0 0 8px; color: #2ebba8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg width="48" height="48" fill="white" viewBox="0 0 24 24">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </div>
    
    <h1>Dev Server Offline</h1>
    <p class="subtitle">Development server is not running</p>
    
    <div class="status-card">
      <div class="status-row">
        <span>Server Status</span>
        <span class="status-offline">
          <span class="status-dot pulse"></span>
          Offline
        </span>
      </div>
      <div class="status-row">
        <span>Expected URL</span>
        <code style="color: #2ebba8; font-size: 14px;">localhost:5173</code>
      </div>
    </div>
    
    <div class="instruction">
      <h3>Start Development Server</h3>
      <div class="code">npm run dev</div>
    </div>
    
    <button onclick="retryConnection()" class="btn btn-primary">
      🔄 Retry Connection
    </button>
    
    <button onclick="clearPWACache()" class="btn btn-secondary">
      🗑️ Clear Cache & Reload
    </button>
    
    <div class="footer">
      <p>{{APP_NAME}} v{{APP_VERSION}} • Development Mode</p>
      <p>Service Worker Active</p>
    </div>
  </div>
  
  <script>
    let retryCount = 0;
    const maxRetries = 6; // Reduce to 30 seconds total
    let retryInterval;
    
    async function retryConnection() {
      try {
        const response = await fetch('/', { 
          cache: 'no-cache',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        if (response.ok && response.status === 200) {
          window.location.reload();
        }
      } catch (error) {
        // Silently handle errors to reduce console noise
      }
    }
    
    async function clearPWACache() {
      try {
        // Clear all caches
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // Unregister service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
        }
        
        // Reload page
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear cache:', error);
        console.error('Please try clearing cache manually via DevTools.');
      }
    }
    
    // Auto-retry with exponential backoff
    function startAutoRetry() {
      if (retryCount >= maxRetries) {
        // Don't log auto-retry messages to reduce noise
        return;
      }
      
      const delay = Math.min(5000 + (retryCount * 2000), 15000); // 5s, 7s, 9s, 11s, 13s, 15s
      
      retryInterval = setTimeout(async () => {
        retryCount++;
        await retryConnection();
        startAutoRetry();
      }, delay);
    }
    
    // Start auto-retry after initial delay
    setTimeout(startAutoRetry, 3000);
    
    // Stop auto-retry when page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && retryInterval) {
        clearTimeout(retryInterval);
      } else if (!document.hidden) {
        startAutoRetry();
      }
    });
  </script>
</body>
</html>`;

/**
 * Cache Management Utilities
 * Intelligent cache lifecycle management and cleanup
 */
const CacheManager = {
  /**
   * Retrieves all application-specific caches
   * @returns {Promise<string[]>} Array of cache names
   */
  getAppCaches: async () => {
    const cacheNames = await caches.keys();
    return cacheNames.filter(name => name.startsWith(CACHE_CONFIG.CACHE_PREFIX));
  },
  
  /**
   * Checks if current cache version exists
   * @returns {Promise<boolean>} True if current cache exists
   */
  currentCacheExists: async () => {
    const cacheNames = await caches.keys();
    return cacheNames.includes(CACHE_NAME);
  },
  
  /**
   * Performs intelligent cleanup of old caches
   * Keeps only the most recent versions within limits
   * @returns {Promise<void>}
   */
  cleanupOldCaches: async () => {
    const appCaches = await CacheManager.getAppCaches();
    const currentCacheIndex = appCaches.indexOf(CACHE_NAME);
    
    const sortedCaches = appCaches.sort((a, b) => {
      const versionA = a.replace(CACHE_CONFIG.CACHE_PREFIX, '');
      const versionB = b.replace(CACHE_CONFIG.CACHE_PREFIX, '');
      return versionB.localeCompare(versionA);
    });
    
    const cachesToDelete = [];
    if (sortedCaches.length > CACHE_CONFIG.MAX_CACHES) {
      cachesToDelete.push(...sortedCaches.slice(CACHE_CONFIG.MAX_CACHES));
    }
    
    if (!isDevelopment) {
      cachesToDelete.push(...sortedCaches.filter(name => name !== CACHE_NAME));
    }
    
    const deletePromises = cachesToDelete.map(async (cacheName) => {
      logger.log('Deleting old cache:', cacheName);
      return caches.delete(cacheName);
    });
    
    return Promise.all(deletePromises);
  },
  
  /**
   * Forces cache update by clearing and rebuilding
   * @returns {Promise<void>}
   */
  forceCacheUpdate: async () => {
    logger.log('Force updating cache...');
    await caches.delete(CACHE_NAME);
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(STATIC_CACHE_URLS);
  }
};

/**
 * Service Worker Install Event Handler
 * Caches static assets and performs initial setup
 */
self.addEventListener('install', (event) => {
  logger.log(`Installing service worker v{{APP_VERSION}}... (${isDevelopment ? 'dev' : 'prod'})`);
  logger.log(`Cache name: ${CACHE_NAME}`);
  
  if (isDevelopment) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    (async () => {
      try {
        logger.log('Installing new service worker, rebuilding cache...');
        
        const cache = await caches.open(CACHE_NAME);
        
        try {
          await cache.addAll(STATIC_CACHE_URLS);
          logger.log('Static assets cached successfully');
        } catch (addAllError) {
          logger.error('Failed to cache static assets:', addAllError);
          for (const url of STATIC_CACHE_URLS) {
            try {
              await cache.add(url);
              logger.log('Successfully cached:', url);
            } catch (individualError) {
              logger.error('Failed to cache individual asset:', url, individualError.message);
            }
          }
        }
        
        const additionalUrls = [];
        
        try {
          const indexResponse = await fetch('/index.html', { cache: 'no-cache' });
          if (indexResponse.ok) {
            const text = await indexResponse.text();
            
            const scriptMatches = text.match(/<script[^>]+src="([^"]+)"/g);
            const linkMatches = text.match(/<link[^>]+href="([^"]+\.css)"/g);
            
            if (scriptMatches) {
              scriptMatches.forEach(match => {
                const src = match.match(/src="([^"]+)"/)[1];
                if (!src.includes('://')) {
                  const normalizedSrc = src.startsWith('./') ? src.substring(1) : 
                                       src.startsWith('/') ? src : '/' + src;
                  additionalUrls.push(normalizedSrc);
                }
              });
            }
            
            if (linkMatches) {
              linkMatches.forEach(match => {
                const href = match.match(/href="([^"]+)"/)[1];
                if (!href.includes('://')) {
                  const normalizedHref = href.startsWith('./') ? href.substring(1) : 
                                        href.startsWith('/') ? href : '/' + href;
                  additionalUrls.push(normalizedHref);
                }
              });
            }
            
            logger.log('Found additional assets to cache:', additionalUrls);
          }
        } catch (e) {
          logger.log('Could not extract assets from index.html, will cache dynamically:', e.message);
        }
        
        if (additionalUrls.length > 0) {
          const cachePromises = additionalUrls.map(async (url) => {
            try {
              const response = await fetch(url, { cache: 'no-cache' });
              if (response.ok) {
                await cache.put(url, response);
                logger.log('Cached additional asset:', url);
              }
            } catch (error) {
              logger.log('Failed to cache additional asset:', url, error.message);
            }
          });
          
          await Promise.allSettled(cachePromises);
        }
        
        try {
          const mainPageResponse = await fetch('/index.html', { cache: 'no-cache' });
          if (mainPageResponse.ok) {
            await cache.put('/', mainPageResponse.clone());
            await cache.put('/index.html', mainPageResponse.clone());
            logger.log('Main page cached for offline access');
          }
        } catch (e) {
          logger.log('Could not cache main page:', e.message);
        }
        
        try {
          const manifestResponse = await fetch('/manifest.json', { cache: 'no-cache' });
          if (manifestResponse.ok) {
            await cache.put('/manifest.json', manifestResponse.clone());
            logger.log('Manifest.json cached successfully');
          }
        } catch (e) {
          logger.log('Could not cache manifest.json:', e.message);
        }
        
        await CacheManager.cleanupOldCaches();
        logger.log(`Service worker v{{APP_VERSION}} installed successfully`);

      } catch (error) {
        logger.error('Error during service worker installation:', error);
      }
    })()
  );
});

/**
 * Service Worker Activate Event Handler
 * Manages cache cleanup and takes control of clients
 */
self.addEventListener('activate', (event) => {
  logger.log(`Activating service worker v{{APP_VERSION}}... (${isDevelopment ? 'dev' : 'prod'})`);
  
  event.waitUntil(
    (async () => {
      try {
        await CacheManager.cleanupOldCaches();
        
        const appCaches = await CacheManager.getAppCaches();
        logger.log('Active caches after cleanup:', appCaches);
        
        await self.clients.claim();
        
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION,
            cacheName: CACHE_NAME,
            isDevelopment: isDevelopment
          });
        });
        
        logger.log(`Service worker v{{APP_VERSION}} activated and controlling all clients`);
        
      } catch (error) {
        logger.error('Error during activation:', error);
        try {
          await self.clients.claim();
        } catch (claimError) {
          logger.error('Error claiming clients:', claimError);
        }
      }
    })()
  );
});

/**
 * Service Worker Fetch Event Handler
 * Implements cache-first strategy with intelligent fallbacks
 */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  /**
   * Static File Handling
   * Handle robots.txt and sitemap.xml before other processing
   */
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // Handle robots.txt and sitemap.xml explicitly
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            return response;
          }
          throw new Error('File not found');
        })
        .catch(() => {
          return new Response('Not Found', { status: 404 });
        })
    );
    return;
  }

  /**
   * Development Mode Fetch Strategy
   * Network-first with minimal caching for faster development
   */
  if (isDevelopment) {
    const shouldSkip = DEV_EXCLUDE_PATTERNS.some(pattern => 
      pattern.test(event.request.url)
    );
    
    if (shouldSkip) {
      return;
    }
    
    // Navigation requests in development
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request, { cache: 'no-cache' })
          .catch(() => {
            // Only serve offline page on actual network failure (dev server not running)
            return new Response(DEV_OFFLINE_PAGE, {
              headers: { 'Content-Type': 'text/html' },
              status: 503
            });
          })
      );
      return;
    }
    
    // Non-navigation requests in development
    event.respondWith(
      (async () => {
        try {
          if (event.request.url.includes('favicon.ico') || event.request.url.includes('favicon.svg')) {
            try {
              const response = await fetch(event.request);
              return response;
            } catch (error) {
              return new Response(null, { 
                status: 404, 
                statusText: 'Not Found'
              });
            }
          }

          try {
            const response = await fetch(event.request);
            
            if (response && response.status === 200 && response.type === 'basic') {
              const shouldCache = DYNAMIC_CACHE_PATTERNS.some(pattern => 
                pattern.test(event.request.url)
              );
              
              if (shouldCache) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache))
                  .catch(() => {});
              }
            }
            
            return response;
            
          } catch (networkError) {
            try {
              const cachedResponse = await caches.match(event.request);
              if (cachedResponse) {
                return cachedResponse;
              }
              
              if (event.request.destination === 'image') {
                return new Response(null, { 
                  status: 404, 
                  statusText: 'Image Not Found'
                });
              }
              
              return new Response('Service Unavailable', { 
                status: 503, 
                statusText: 'Service Unavailable' 
              });
              
            } catch (cacheError) {
              return new Response(null, { status: 404 });
            }
          }
          
        } catch (error) {
          return new Response(null, { status: 404 });
        }
      })()
    );
    return;
  }

  /**
   * Production Mode Fetch Strategy
   * Cache-first with aggressive offline support
   */
  event.respondWith(
    (async () => {
      try {
        // Static file handling - robots.txt and sitemap.xml
        const url = new URL(event.request.url);
        const pathname = url.pathname;
        
        if (pathname === '/robots.txt' || pathname === '/sitemap.xml') {
          try {
            const response = await fetch(event.request);
            if (response.ok) {
              return response;
            }
            throw new Error('File not found');
          } catch (error) {
            return new Response('Not Found', { status: 404 });
          }
        }

        // Favicon handling
        if (event.request.url.includes('favicon.ico') || event.request.url.includes('favicon.svg')) {
          try {
            const response = await fetch(event.request);
            return response;
          } catch (error) {
            return new Response(null, { 
              status: 404, 
              statusText: 'Not Found'
            });
          }
        }

        // Manifest handling
        if (event.request.url.includes('manifest.json')) {
          const cachedManifest = await caches.match('/manifest.json');
          if (cachedManifest) {
            logger.log('Serving manifest.json from cache');
            return cachedManifest;
          }
          
          try {
            const response = await fetch('/manifest.json');
            if (response && response.ok) {
              const cache = await caches.open(CACHE_NAME);
              cache.put('/manifest.json', response.clone()).catch(() => {});
              logger.log('Fetched and cached manifest.json');
              return response;
            }
          } catch (error) {
            logger.error('Failed to fetch manifest.json:', error);
            return new Response(JSON.stringify({
              "name": "{{APP_NAME}}",
              "short_name": "{{APP_NAME}}",
              "start_url": "/",
              "display": "standalone",
              "background_color": "#ffffff",
              "theme_color": "#2ebba8"
            }), {
              headers: { 'Content-Type': 'application/json' },
              status: 200
            });
          }
        }

        // Navigation requests - cache-first for instant offline access
        if (event.request.mode === 'navigate') {
          const cachedResponse = await caches.match('/index.html') || 
                                 await caches.match('/');
          
          if (cachedResponse) {
            logger.log('Serving navigation from cache - instant offline access');
            
            // Background cache update
            fetch('/index.html').then(response => {
              if (response && response.ok) {
                const cache = caches.open(CACHE_NAME).then(cache => {
                  cache.put('/', response.clone()).catch(() => {});
                  cache.put('/index.html', response.clone()).catch(() => {});
                  logger.log('Background cache update completed');
                });
              }
            }).catch(() => {});
            
            return cachedResponse;
          }
          
          try {
            const response = await fetch('/index.html', { 
              cache: 'no-cache',
              signal: AbortSignal.timeout(3000)
            });
            if (response && response.ok) {
              const cache = await caches.open(CACHE_NAME);
              cache.put('/', response.clone()).catch(() => {});
              cache.put('/index.html', response.clone()).catch(() => {});
              logger.log('First visit - cached navigation response');
              return response;
            }
          } catch (networkError) {
            logger.warn('Network failed for first navigation visit');
          }
          
          logger.error('Critical: No cache available for navigation request');
          return new Response(`
            <!DOCTYPE html>
            <html lang="en" class="dark">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>{{APP_NAME}} - Offline</title>
              <style>
                * { box-sizing: border-box; }
                body { 
                  margin: 0; 
                  font-family: system-ui, -apple-system, sans-serif; 
                  background: #0f172a; 
                  color: white; 
                  min-height: 100vh; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  padding: 16px;
                }
                .container { max-width: 400px; width: 100%; text-align: center; }
                .icon { 
                  width: 64px; height: 64px; 
                  background: #374151; 
                  margin: 0 auto 24px;
                  border-radius: 12px; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                }
                h1 { font-size: 24px; margin: 0 0 8px; color: #2ebba8; }
                .subtitle { color: #94a3b8; font-size: 16px; margin-bottom: 24px; }
                .btn { 
                  width: 100%; 
                  padding: 12px; 
                  border: none; 
                  border-radius: 8px; 
                  font-weight: 600; 
                  cursor: pointer; 
                  background: #2ebba8; 
                  color: white;
                  transition: all 0.2s;
                  margin-bottom: 12px;
                }
                .btn:hover { background: #26a69a; }
                .info { 
                  background: #1e293b; 
                  padding: 16px; 
                  border-radius: 8px; 
                  margin-top: 24px;
                  font-size: 14px;
                  color: #94a3b8;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">⚠️</div>
                <h1>{{APP_NAME}}</h1>
                <p class="subtitle">App not cached yet</p>
                <button onclick="window.location.reload()" class="btn">
                  🔄 Try Again
                </button>
                <button onclick="clearCacheAndReload()" class="btn" style="background: #6b7280;">
                  🗑️ Clear Cache & Reload
                </button>
                <div class="info">
                  <p><strong>First visit?</strong> Please ensure you have an internet connection for the initial app download.</p>
                  <p><strong>Offline mode</strong> will work after the first successful visit.</p>
                </div>
              </div>
              <script>
                async function clearCacheAndReload() {
                  try {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      await Promise.all(registrations.map(reg => reg.unregister()));
                    }
                    window.location.reload();
                  } catch (error) {
                    console.error('Failed to clear cache:', error);
                    window.location.reload();
                  }
                }
              </script>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' },
            status: 200
          });
        }

        // Try cache first for other requests
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          logger.log('Serving from cache:', event.request.url);
          
          // Background cache update (stale-while-revalidate)
          fetch(event.request).then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              const shouldCache = DYNAMIC_CACHE_PATTERNS.some(pattern => 
                pattern.test(event.request.url)
              );
              if (shouldCache) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, response.clone()).catch(() => {});
                });
              }
            }
          }).catch(() => {});
          
          return cachedResponse;
        }

        // Fetch from network
        try {
          const response = await fetch(event.request);
          
          if (response && response.status === 200 && response.type === 'basic') {
            const shouldCache = DYNAMIC_CACHE_PATTERNS.some(pattern => 
              pattern.test(event.request.url)
            );

            if (shouldCache) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  logger.log('Caching dynamic asset:', event.request.url);
                  return cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  logger.debug('Cache write failed (non-critical):', error.message);
                });
            }
          }

          return response;
          
        } catch (fetchError) {
          logger.warn('Network fetch failed for:', event.request.url, fetchError.message);
          
          const fallbackCache = await caches.match(event.request);
          if (fallbackCache) {
            logger.log('Serving stale cache for failed request:', event.request.url);
            return fallbackCache;
          }
          
          if (event.request.mode === 'navigate') {
            const indexCache = await caches.match('/index.html');
            if (indexCache) {
              logger.log('Serving cached index.html for navigation fallback');
              return indexCache;
            }
          }
          
          if (event.request.destination === 'image') {
            return new Response(null, { 
              status: 404, 
              statusText: 'Image Not Found'
            });
          }
          
          return new Response('Service Unavailable', { 
            status: 503, 
            statusText: 'Service Unavailable' 
          });
        }
        
      } catch (cacheError) {
        logger.error('Cache operation failed:', cacheError);
        
        try {
          return await fetch(event.request);
        } catch (finalError) {
          logger.error('All fallbacks failed for:', event.request.url);
          
          return new Response('Service Unavailable', { 
            status: 503, 
            statusText: 'Service Unavailable' 
          });
        }
      }
    })()
  );
});

/**
 * Background Sync Event Handler
 * Handles background synchronization tasks
 */
self.addEventListener('sync', (event) => {
  logger.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      logger.log('Performing background sync...')
    );
  }
});

/**
 * Push Notification Event Handler
 * Manages incoming push notifications
 */
self.addEventListener('push', (event) => {
  logger.log('Push message received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/assets/img/icons/nuwault_icon_192x192.png',
    badge: '/assets/img/icons/nuwault_icon_48x48.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('{{APP_NAME}}', options)
  );
});

/**
 * Notification Click Event Handler
 * Handles user interactions with notifications
 */
self.addEventListener('notificationclick', (event) => {
  logger.log('Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow('/')
  );
});

/**
 * Message Event Handler
 * Processes commands from client applications
 */
self.addEventListener('message', (event) => {
  logger.log('Message received:', event.data);
  
  if (!event.data || !event.data.type) {
    return;
  }
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        (async () => {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
            logger.log('All caches cleared successfully');
            event.ports[0]?.postMessage({ success: true, clearedCaches: cacheNames.length });
          } catch (error) {
            logger.error('Error clearing caches:', error);
            event.ports[0]?.postMessage({ success: false, error: error.message });
          }
        })()
      );
      break;
      
    case 'CLEAR_APP_CACHE':
      event.waitUntil(
        (async () => {
          try {
            const appCaches = await CacheManager.getAppCaches();
            await Promise.all(appCaches.map(cacheName => caches.delete(cacheName)));
            logger.log('App caches cleared successfully');
            event.ports[0]?.postMessage({ success: true, clearedCaches: appCaches.length });
          } catch (error) {
            logger.error('Error clearing app caches:', error);
            event.ports[0]?.postMessage({ success: false, error: error.message });
          }
        })()
      );
      break;
      
    case 'FORCE_UPDATE':
      event.waitUntil(
        (async () => {
          try {
            await CacheManager.forceCacheUpdate();
            await CacheManager.cleanupOldCaches();
            logger.log('Cache force updated successfully');
            event.ports[0]?.postMessage({ success: true, cacheVersion: CACHE_VERSION });
          } catch (error) {
            logger.error('Error force updating cache:', error);
            event.ports[0]?.postMessage({ success: false, error: error.message });
          }
        })()
      );
      break;
      
    case 'GET_CACHE_INFO':
      event.waitUntil(
        (async () => {
          try {
            const appCaches = await CacheManager.getAppCaches();
            const currentExists = await CacheManager.currentCacheExists();
            
            const info = {
              currentVersion: CACHE_VERSION,
              currentCacheName: CACHE_NAME,
              currentCacheExists: currentExists,
              appCaches: appCaches,
              isDevelopment: isDevelopment
            };
            
            event.ports[0]?.postMessage({ success: true, info });
          } catch (error) {
            logger.error('Error getting cache info:', error);
            event.ports[0]?.postMessage({ success: false, error: error.message });
          }
        })()
      );
      break;
      
    default:
      logger.warn('Unknown message type:', type);
  }
}); 