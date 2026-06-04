/**
 * Main Application Entry Point
 * Initializes the PWA application with all core features
 */

// Core styles
import './style.css'

// Core utilities
import { initializeTheme } from './utils/theme.js'
import { logEnvironmentInfo, PWA_CONFIG, FEATURE_FLAGS } from './utils/config.js'
import { PWAManager } from './utils/pwaManager.js'
import { ManifestManager } from './utils/manifestManager.js'
import { logger } from './utils/logger.js'
import { initI18n } from './utils/i18n.js'
import { setupSmoothScrollManager } from './utils/smoothScroll.js'

// Application components
import { Header } from './components/Header.js'
import { Hero } from './components/Hero.js'
import { UserGuide } from './components/UserGuide.js'
import { Features } from './components/Features.js'
import { FAQ } from './components/FAQ.js'
import { Footer } from './components/Footer.js'
import { ScrollToTop } from './components/ScrollToTop.js'

/**
 * Application Initialization
 * Bootstraps the entire application with proper error handling
 */
const initApp = async () => {
  logEnvironmentInfo()
  
  // Initialize internationalization system
  try {
    await initI18n()
    logger.log('[APP] i18n initialized successfully')
  } catch (error) {
    logger.error('[APP] Failed to initialize i18n:', error)
  }
  
  // Initialize theme system
  initializeTheme()
  
  // Initialize PWA manifest manager
  const manifestManager = new ManifestManager()
  
  // Initialize PWA manager if enabled
  let pwaManager = null
  if (PWA_CONFIG.enabled) {
    pwaManager = new PWAManager()
    
    // Development debugging utilities
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.pwaManager = pwaManager
    }
    
    logger.log('[APP] PWA features enabled')
  } else {
    logger.log('[APP] PWA features disabled')
  }
  
  // Development debugging setup
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.manifestManager = manifestManager
    
    /**
     * PWA Debug Utilities
     * Development-only debugging tools for PWA functionality
     */
    window.pwaDebug = {
      async status() {
        if (pwaManager) {
          return await pwaManager.logPWAStatus();
        } else {
          logger.log('[PWA Debug] PWA Manager not available (PWA disabled)');
          return null;
        }
      },
      
      async cacheStatus() {
        if (pwaManager) {
          const status = await pwaManager.getCacheStatus();
          logger.log('[PWA Debug] Cache Status:', status);
          return status;
        } else {
          logger.log('[PWA Debug] PWA Manager not available (PWA disabled)');
          return null;
        }
      },
      
      async clearCache() {
        if (pwaManager) {
          const result = await pwaManager.clearCache();
          logger.log('[PWA Debug] Cache cleared:', result);
          return result;
        } else {
          logger.log('[PWA Debug] PWA Manager not available (PWA disabled)');
          return false;
        }
      },
      
      async clearAppCache() {
        if (pwaManager) {
          const result = await pwaManager.clearAppCache();
          logger.log('[PWA Debug] App cache cleared:', result);
          return result;
        } else {
          logger.log('[PWA Debug] PWA Manager not available (PWA disabled)');
          return false;
        }
      },
      
      async forceUpdate() {
        if (pwaManager) {
          const result = await pwaManager.forceCacheUpdate();
          logger.log('[PWA Debug] Cache force updated:', result);
          return result;
        } else {
          logger.log('[PWA Debug] PWA Manager not available (PWA disabled)');
          return false;
        }
      },
      
      help() {
        logger.log('[PWA Debug] Available PWA Debug Commands:');
        logger.log('[PWA Debug]   pwaDebug.status()      - Show detailed PWA status');
        logger.log('[PWA Debug]   pwaDebug.cacheStatus() - Show cache information');
        logger.log('[PWA Debug]   pwaDebug.clearCache()  - Clear all caches');
        logger.log('[PWA Debug]   pwaDebug.clearAppCache() - Clear only app caches');
        logger.log('[PWA Debug]   pwaDebug.forceUpdate() - Force cache update');
        logger.log('[PWA Debug]   pwaDebug.help()        - Show this help');
      }
    };
    
    logger.log('[APP] 🔧 PWA Debug Tools Available! Type pwaDebug.help() for commands');
    
    // Development testing features
    setTimeout(async () => {
      if (FEATURE_FLAGS.enablePasswordTests) {
        const { analyzeCharacterDistribution } = await import('@nuwax-io/nuwault-core');
        logger.info('[APP] 🚀 Testing improved character distribution...');
        const analysis = analyzeCharacterDistribution("TestPassword123!");
        logger.info('[APP] 🔍 Character distribution analysis:', analysis);
      } else {
        logger.info('[APP] 💡 Set VITE_ENABLE_PASSWORD_TESTS=true in .env.development to run character distribution tests');
      }
    }, 2000)
  }
  
  // Application DOM structure creation
  const app = document.querySelector('#app')
  app.innerHTML = ''
  
  const layout = document.createElement('div')
  layout.className = 'min-h-screen layout-bg'
  
  const mainContent = document.createElement('main')
  mainContent.className = 'flex-grow'
  
  // Component assembly
  layout.appendChild(Header())
  mainContent.appendChild(Hero())
  mainContent.appendChild(Features())
  mainContent.appendChild(UserGuide())
  mainContent.appendChild(FAQ())
  layout.appendChild(mainContent)
  layout.appendChild(Footer())
  
  // Final DOM assembly
  app.appendChild(layout)
  document.body.appendChild(ScrollToTop())
  
  // Initialize smooth scrolling with i18n support
  setupSmoothScrollManager()
}

/**
 * Application Bootstrap
 * Ensures app initialization occurs at the correct time
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp)
} else {
  initApp()
}
