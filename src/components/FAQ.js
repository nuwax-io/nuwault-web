/**
 * FAQ Section Component
 * Renders an interactive FAQ section with collapsible items, cache status checking,
 * and language change support for the password generator application.
 * 
 * @author NuwaX
 */
import { t } from '../utils/i18n.js';

/**
 * Creates and returns the FAQ section component
 * @returns {HTMLElement} The FAQ section element
 */
export const FAQ = () => {
  const faq = document.createElement('section');
  faq.className = 'py-16 px-4 sm:px-6 lg:px-8 section-even-bg';
  faq.id = 'faq';
  
  const faqInstance = new FAQController(faq);
  faqInstance.init();
  
  return faq;
};

/**
 * FAQ Controller Class
 * Manages FAQ item rendering, interactions, and cache status functionality
 */
class FAQController {
  /**
   * Initialize FAQ controller with element reference
   * @param {HTMLElement} element - The FAQ section element
   */
  constructor(element) {
    this.element = element;
    this.faqItemIds = ['faq-1', 'faq-2', 'faq-3', 'faq-4', 'faq-5', 'faq-6', 'faq-6a', 'faq-6b', 'faq-7', 'faq-8', 'faq-9', 'faq-10'];
  }

  /**
   * Initialize the FAQ component
   * Sets up rendering and event listeners
   */
  init() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the main FAQ structure
   * Creates the container and title elements
   */
  render() {
    this.element.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ${t('faq.title')}
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ${t('faq.subtitle')}
          </p>
        </div>
        
        <div id="faq-container" class="space-y-4">
        </div>
      </div>
    `;

    this.renderFAQItems();
  }

  /**
   * Generate FAQ data from translation keys
   * Handles special cases like cache status replacement
   * @returns {Array} Array of FAQ items with id, question, and answer
   */
  getFAQData() {
    return this.faqItemIds.map(id => {
      let answer = t(`faq.items.${id}.answer`);
      
      // Special handling for cache status FAQ item
      if (id === 'faq-6b') {
        answer = answer.replace('{{checkingStatus}}', t('faq.cacheStatus.checkingStatus'));
      }
      
      return {
        id,
        question: t(`faq.items.${id}.question`),
        answer
      };
    });
  }

  /**
   * Render individual FAQ items
   * Creates collapsible FAQ items with proper accessibility attributes
   */
  renderFAQItems() {
    const container = this.element.querySelector('#faq-container');
    const faqData = this.getFAQData();
    
    container.innerHTML = '';
    
    faqData.forEach((item, _index) => {
      const faqItem = document.createElement('div');
      faqItem.className = 'faq-item card-bg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md';
      
      faqItem.innerHTML = `
        <button 
          class="faq-button w-full px-6 py-4 text-left focus:outline-none" 
          data-faq-id="${item.id}"
          aria-expanded="false"
          aria-controls="${item.id}-content"
        >
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white pr-4">
              ${item.question}
            </h3>
            <div class="flex-shrink-0">
              <svg class="faq-icon w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </button>
        <div 
          id="${item.id}-content" 
          class="faq-content overflow-hidden transition-all duration-300 ease-in-out max-h-0"
          aria-labelledby="${item.id}-button"
        >
          <div class="px-6 pb-4">
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
              ${item.answer}
            </p>
          </div>
        </div>
      `;
      
      container.appendChild(faqItem);
    });
    
    this.initializeCacheStatus();
  }

  /**
   * Check browser cache and storage support
   * Tests for Cache API, Service Worker, localStorage, and IndexedDB support
   * @returns {Object} Object containing support status for each feature
   */
  checkCacheStatus() {
    const status = {
      cacheAPI: 'caches' in window,
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: 'localStorage' in window,
      indexedDB: 'indexedDB' in window
    };
    
    return status;
  }

  /**
   * Generate HTML for cache status display
   * Creates a comprehensive status grid with feature support indicators
   * @param {Object} status - Cache support status object
   * @returns {string} HTML string for cache status display
   */
  generateCacheStatusHTML(status) {
    let statusHTML = '<div class="cache-status-container space-y-3">';
    
    const overallStatus = status.cacheAPI && status.serviceWorker;
    statusHTML += '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">';
    
    const features = [
      { key: 'cacheAPI', name: t('faq.cacheStatus.features.cacheAPI.name'), description: t('faq.cacheStatus.features.cacheAPI.description') },
      { key: 'serviceWorker', name: t('faq.cacheStatus.features.serviceWorker.name'), description: t('faq.cacheStatus.features.serviceWorker.description') },
      { key: 'localStorage', name: t('faq.cacheStatus.features.localStorage.name'), description: t('faq.cacheStatus.features.localStorage.description') },
      { key: 'indexedDB', name: t('faq.cacheStatus.features.indexedDB.name'), description: t('faq.cacheStatus.features.indexedDB.description') }
    ];
    
    features.forEach(feature => {
      const isSupported = status[feature.key];
      statusHTML += `
        <div class="flex items-center gap-2 p-2 rounded border ${isSupported ? 'bg-primary-50 dark:bg-gray-800 border-primary-400 dark:border-primary-700' : 'bg-red-50 dark:bg-gray-800 border-red-200 dark:border-red-700'}">
          <div class="flex-shrink-0">
            ${isSupported ? 
              '<svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' :
              '<svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
            }
          </div>
          <div>
            <div class="font-medium ${isSupported ? 'text-primary-800 dark:text-white' : 'text-red-800 dark:text-red-300'}">
              ${feature.name}
            </div>
            <div class="text-xs ${isSupported ? 'text-primary-600 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}">
              ${feature.description}
            </div>
          </div>
        </div>
      `;
    });
    
    statusHTML += '</div>';
    
    // Display help instructions if cache features are not supported
    if (!overallStatus) {
      statusHTML += `
        <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">${t('faq.cacheStatus.howToEnable')}</h4>
          <div class="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
            <div><strong>Chrome/Edge:</strong> ${t('faq.cacheStatus.instructions.chrome')}</div>
            <div><strong>Firefox:</strong> ${t('faq.cacheStatus.instructions.firefox')}</div>
            <div><strong>Safari:</strong> ${t('faq.cacheStatus.instructions.safari')}</div>
          </div>
          <button onclick="window.location.reload()" class="mt-3 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors">
            ${t('faq.cacheStatus.testAgain')}
          </button>
        </div>
      `;
    }
    
    statusHTML += '</div>';
    return statusHTML;
  }

  /**
   * Initialize cache status display
   * Finds cache status element and populates it with current browser support
   */
  initializeCacheStatus() {
    const cacheStatusElement = this.element.querySelector('#cache-status-info');
    if (cacheStatusElement) {
      const status = this.checkCacheStatus();
      cacheStatusElement.innerHTML = this.generateCacheStatusHTML(status);
    }
  }

  /**
   * Attach event listeners for FAQ interactions
   * Handles click events, language changes, and accordion behavior
   */
  attachEventListeners() {
    // Re-render FAQ when language changes
    window.addEventListener('languageChanged', () => {
      this.render();
    });

    // Handle FAQ item toggle interactions
    this.element.addEventListener('click', (e) => {
      const button = e.target.closest('.faq-button');
      if (!button) return;

      const faqId = button.getAttribute('data-faq-id');
      const content = this.element.querySelector(`#${faqId}-content`);
      const icon = button.querySelector('.faq-icon');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      
      // Accordion behavior: close all other items first
      this.element.querySelectorAll('.faq-button').forEach(otherButton => {
        if (otherButton !== button) {
          const otherFaqId = otherButton.getAttribute('data-faq-id');
          const otherContent = this.element.querySelector(`#${otherFaqId}-content`);
          const otherIcon = otherButton.querySelector('.faq-icon');
          
          otherButton.setAttribute('aria-expanded', 'false');
          otherContent.style.maxHeight = '0px';
          otherIcon.style.transform = 'rotate(0deg)';
        }
      });
      
      // Toggle current FAQ item
      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
      } else {
        button.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
      }
    });
    
    // Close all FAQ items when clicking outside the FAQ section
    document.addEventListener('click', (e) => {
      if (!this.element.contains(e.target)) {
        const faqButtons = this.element.querySelectorAll('.faq-button');
        faqButtons.forEach(button => {
          const faqId = button.getAttribute('data-faq-id');
          const content = this.element.querySelector(`#${faqId}-content`);
          const icon = button.querySelector('.faq-icon');
          
          button.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = '0px';
          icon.style.transform = 'rotate(0deg)';
        });
      }
    });
  }
} 