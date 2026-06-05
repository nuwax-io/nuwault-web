/**
 * @fileoverview Smooth Scrolling Utility
 * Provides smooth scrolling behavior for anchor links with header offset compensation
 * Includes dynamic reinitialization on language changes and DOM mutations
 * @author NuwaX
 */

import { logger } from './logger.js'

let _scrollObserver = null;

/**
 * Initialize smooth scrolling behavior for anchor links with header offset
 * Safe to call multiple times - removes existing listeners to prevent duplicates
 */
export const initSmoothScrolling = () => {
  try {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      if (anchor._smoothScrollListener) {
        anchor.removeEventListener('click', anchor._smoothScrollListener)
      }
    })

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      const smoothScrollListener = function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute('href'))
        if (target) {
          const header = document.querySelector('header')
          const headerHeight = header ? header.offsetHeight : 0
          const offsetPosition = target.offsetTop - headerHeight

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }

      anchor._smoothScrollListener = smoothScrollListener
      anchor.addEventListener('click', smoothScrollListener)
    })

    logger.log('[SmoothScroll] Smooth scrolling initialized for anchor links')
  } catch (error) {
    logger.error('[SmoothScroll] Error initializing smooth scrolling:', error)
  }
}

/**
 * Setup comprehensive smooth scroll management with event listeners
 * Handles language changes and DOM mutations for dynamic content
 */
export const setupSmoothScrollManager = () => {
  initSmoothScrolling()

  window.addEventListener('languageChanged', () => {
    setTimeout(() => {
      initSmoothScrolling()
      logger.log('[SmoothScroll] Smooth scrolling reinitialized after language change')
    }, 100)
  })

  _scrollObserver = new MutationObserver((mutations) => {
    let shouldReinit = false

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const hasAnchorLinks = node.querySelector && node.querySelector('a[href^="#"]')
            if (hasAnchorLinks) {
              shouldReinit = true
            }
          }
        })
      }
    })

    if (shouldReinit) {
      clearTimeout(_scrollObserver._reinitTimeout)
      _scrollObserver._reinitTimeout = setTimeout(() => {
        initSmoothScrolling()
        logger.log('[SmoothScroll] Smooth scrolling reinitialized after DOM changes')
      }, 150)
    }
  })

  _scrollObserver.observe(document.body, {
    childList: true,
    subtree: true
  })

  logger.log('[SmoothScroll] Smooth scroll manager initialized with language change and DOM mutation listeners')
}

/**
 * Clean up all smooth scrolling listeners and disconnect the DOM observer
 */
export const cleanupSmoothScrolling = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor._smoothScrollListener) {
      anchor.removeEventListener('click', anchor._smoothScrollListener)
      delete anchor._smoothScrollListener
    }
  })

  if (_scrollObserver) {
    _scrollObserver.disconnect()
    _scrollObserver = null
  }

  logger.log('[SmoothScroll] Smooth scrolling listeners cleaned up')
}
