/**
 * Hero Section Component
 * Renders the main hero section with title, feature highlights, and password generator.
 * Features responsive two-column layout with animations and internationalization support.
 * 
 * @author NuwaX
 */
import { PasswordGenerator } from '../password/Generator.js';
import { t } from '../utils/i18n.js';

/**
 * Creates and returns the Hero section component
 * @returns {HTMLElement} The Hero section element
 */
export const Hero = () => {
  const hero = document.createElement('section');
  hero.className = 'py-16 px-4 sm:px-6 lg:px-8 section-odd-bg';
  hero.id = 'generator';
  
  const heroInstance = new HeroController(hero);
  heroInstance.init();
  
  return hero;
};

/**
 * Hero Controller Class
 * Manages hero content rendering and password generator integration
 */
class HeroController {
  /**
   * Initialize Hero controller with element reference
   * @param {HTMLElement} element - The Hero section element
   */
  constructor(element) {
    this.element = element;
  }

  /**
   * Initialize the Hero component
   * Sets up rendering, password generator, and event listeners
   */
  init() {
    this.render();
    this.setupPasswordGenerator();
    this.attachEventListeners();
  }

  /**
   * Render the Hero section content
   * Creates responsive two-column layout with content and password generator
   */
  render() {
    this.element.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6 animate-fade-in order-2 lg:order-1">
            <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              ${t('hero.title.main')}
              <span class="text-primary-600 dark:text-primary-400">${t('hero.title.highlight')}</span> ${t('hero.title.end')}
            </h1>
            
            <p class="text-lg text-gray-600 dark:text-gray-400">
              ${t('hero.description')}
            </p>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-3">
                <div class="icon-container flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">${t('hero.features.clientSide.title')}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${t('hero.features.clientSide.description')}</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="icon-container flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">${t('hero.features.deterministic.title')}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${t('hero.features.deterministic.description')}</p>
                </div>
              </div>
              
              <div class="flex items-start space-x-3">
                <div class="icon-container flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">${t('hero.features.security.title')}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${t('hero.features.security.description')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div id="password-generator-container" class="animate-slide-up order-1 lg:order-2">
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup password generator component
   * Initializes and renders the password generator in the designated container
   */
  setupPasswordGenerator() {
    if (this.passwordGenerator) {
      this.passwordGenerator.destroy();
    }
    const passwordGeneratorContainer = this.element.querySelector('#password-generator-container');
    this.passwordGenerator = new PasswordGenerator();
    passwordGeneratorContainer.appendChild(this.passwordGenerator.render());
  }

  /**
   * Attach event listeners for component interactions
   * Handles language change events and re-initializes components
   */
  attachEventListeners() {
    // Re-render and reinitialize password generator when language changes
    window.addEventListener('languageChanged', () => {
      this.render();
      this.setupPasswordGenerator();
    });
  }
} 