# Nuwault PWA Setup Guide

This guide covers the Progressive Web App (PWA) installation and configuration for Nuwault.

## What is PWA?

Progressive Web Apps provide native app-like experiences through web technologies, offering:

- **Offline Functionality**: Works without internet connection
- **Install to Home Screen**: Native app installation experience
- **Automatic Updates**: Seamless background updates
- **Fast Loading**: Efficient caching strategies
- **Responsive Design**: Optimized for all devices
- **Secure**: Requires HTTPS in production

## Installation Methods

### Browser Installation

**Chrome/Edge (Desktop & Mobile):**
1. Visit the application URL
2. Look for the install icon in the address bar
3. Click "Install" when the prompt appears
4. The app opens in a standalone window

**Safari (iOS):**
1. Open the app in Safari
2. Tap the share button
3. Select "Add to Home Screen"
4. Confirm the installation

**Firefox:**
1. Access the Firefox menu
2. Select "Install Page as App"
3. Complete the installation process

### Manual Installation

If automatic prompts don't appear:

**Chrome/Edge Desktop:**
- Menu → "Apps" → "Install [app name]"
- Or address bar → "Install" icon

**Chrome Android:**
- Menu → "Add to Home screen"

**Firefox:**
- Menu → "Install Page as App"

**Safari iOS:**
- Share button → "Add to Home Screen"

## Environment Configuration

### PWA Control Variables

```bash
# Enable/disable PWA features
VITE_PWA_ENABLED=true

# App configuration
VITE_APP_NAME=Nuwault
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Privacy-focused deterministic password generator

# PWA-specific settings
VITE_PWA_SHORT_NAME=Nuwault
VITE_PWA_THEME_COLOR=#2ebba8
```

### Development Settings

```bash
# Development mode detection
VITE_NODE_ENV=development

# Debug logging (development only)
VITE_ENABLE_DEBUG_MODE=false
```

## Developer Information

### Build Scripts

```bash
# Complete PWA setup
npm run pwa:setup

# Generate PWA icons
npm run generate-icons

# Generate service worker
npm run generate-sw

# Production build with PWA
npm run build
```

### PWA Architecture

#### Service Worker (`sw.template.js`)
- **Cache Management**: Automatic versioning with build hashes
- **Offline Support**: Cache-first strategy for static assets
- **Development Mode**: Network-first with minimal caching
- **Update Detection**: Automatic notification system

#### PWA Manager (`pwaManager.js`)
- **Service Worker Registration**: Secure context validation
- **Install Prompts**: User-friendly installation flow
- **Cache Management**: Comprehensive cache control
- **Update Notifications**: "Update Available" banner shown when new SW reaches `installed` state; `SKIP_WAITING` sent only to `registration.waiting` on user confirmation; `controllerchange` listener reloads the page

#### Service Worker Generator (`generate-sw.js`)
- **Template Processing**: Environment variable injection
- **Cache Versioning**: Unique build identifiers
- **Environment Detection**: Development vs production strategies

### Cache Strategy

**Production:**
- Cache-first for static assets
- Stale-while-revalidate for dynamic content
- Automatic cache cleanup (keeps 5 most recent versions)

**Development:**
- Network-first to avoid stale content
- Minimal caching for faster development
- Custom offline page for dev server issues

## PWA Features

### Offline Functionality
- **Password Generation**: Works completely offline after first visit
- **Settings Persistence**: Theme and language preferences saved locally
- **Cache Management**: Automatic asset caching with 5-version cleanup
- **Browser Cache Dependency**: Offline functionality requires browser cache support
- **Graceful Degradation**: Fallback UI for network failures

**Important:** Offline functionality depends on browser caching. If browser cache is disabled or unsupported, offline usage will not be available.

### Install Experience
- **Smart Prompts**: Context-aware installation suggestions
- **Custom UI**: Branded installation flow
- **Standalone Mode**: Native app-like window experience

### Update System
- **Background Detection**: Automatic new version detection via `updatefound` / `statechange` events
- **User Control**: "Update Available" banner with **Reload** / Later buttons — page only reloads on explicit user action
- **Safe Waiting**: New service worker stays in `waiting` state until the user confirms; `controllerchange` listener triggers the reload
- **Cache Refresh**: Old caches are cleaned up automatically during the new service worker's `activate` phase

## Troubleshooting

### Installation Issues

**Install button not appearing:**
- Verify HTTPS connection (required for PWA)
- Check `VITE_PWA_ENABLED=true` in environment
- Ensure manifest.json is accessible
- Verify service worker registration

**Debug commands:**
```javascript
// Check PWA status
window.pwaManager?.getInstallStatus();

// Check service worker
navigator.serviceWorker.getRegistration();
```

### Offline Issues

**App not working offline:**
- Verify service worker is active
- Check if browser cache is enabled
- Ensure static assets are cached
- Confirm cache API support in browser

**Browser cache disabled:**
- Enable browser cache in settings
- Check if private/incognito mode is active
- Verify storage permissions are granted

**Debug commands:**
```javascript
// Check cache status and browser support
window.pwaManager?.getCacheStatus();
console.log('Cache API supported:', 'caches' in window);

// Clear and rebuild cache
window.pwaManager?.clearAppCache();
window.pwaManager?.forceCacheUpdate();
```

### Update Issues

**Updates not applying:**
- Check service worker update detection
- Clear browser cache manually
- Verify cache versioning

**Manual cache clear:**
```javascript
// Clear all caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## Platform Support

### Desktop
- **Chrome/Edge**: Full PWA support with auto-install prompts
- **Firefox**: PWA support, limited install prompts
- **Safari**: Basic PWA support, manual installation

### Mobile
- **Chrome (Android)**: Full PWA support with WebAPK generation
- **Safari (iOS)**: Manual installation, limited PWA features
- **Samsung Internet**: Full PWA support

**Cache Support:** All modern browsers support Cache API. Private/incognito mode may disable caching, preventing offline functionality.

## Development Debugging

### Console Commands

```javascript
// Complete PWA status and development info
window.pwaManager?.logPWAStatus();
window.pwaManager?.getDevelopmentInfo();
window.manifestManager?.getStatus();

// Cache management and browser support check
console.log('Cache API supported:', 'caches' in window);
console.log('Service Worker supported:', 'serviceWorker' in navigator);
window.pwaManager?.getCacheStatus();
window.pwaManager?.clearAppCache();
window.pwaManager?.forceCacheUpdate();

// Complete PWA reset (development only)
window.pwaManager?.resetPWA();
```

## Technical Requirements

### PWA Checklist
- Web App Manifest (manifest.json) — includes `id`, `description`, `display_override`
- Service Worker (sw.js)
- HTTPS protocol (production)
- Browser Cache API support (for offline functionality)
- Responsive design
- PWA icons (16×16 to 512×512, separate `"any"` and `"maskable"` entries)
- Valid start URL
- External redirect script (`redirect.js`) served from origin root

### File Structure
```
public/
├── manifest.json            # PWA manifest (id, description, display_override)
├── sw.js                    # Generated service worker (from sw.template.js)
├── redirect.js              # Early URL redirect script (no inline scripts in HTML)
└── assets/
    └── img/
        ├── icons/           # PWA icons (any + maskable)
        └── favicon/         # Favicon files

src/
├── templates/
│   └── sw.template.js       # Service worker template (env vars injected at build)
└── utils/
    ├── pwaManager.js        # SW registration, update notifications, cache control
    └── manifestManager.js   # Dynamic manifest link and meta tag injection
```

## Configuration Files

### Manifest Generation
The manifest.json is dynamically managed by `manifestManager.js` based on environment variables.

### Service Worker Generation
The service worker is generated from `sw.template.js` with environment-specific configurations.

### Icon Generation
PWA icons are generated using `generate-icons.js` from SVG sources.

---

**Note:** PWA requires HTTPS in production (localhost works for development). Install prompts and offline functionality depend on browser support. For best experience, use Chrome or Edge. 