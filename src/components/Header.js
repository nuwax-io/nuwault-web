/**
 * Header Component
 * Renders the application header with navigation, theme selector, language selector,
 * and mobile menu functionality. Includes logo theme switching and smooth scrolling.
 * 
 * @author NuwaX
 */
import { ThemeSelector } from "./ThemeSelector.js";
import { LanguageSelector } from "./LanguageSelector.js";
import { t } from '../utils/i18n.js';

/**
 * Creates and returns the Header component
 * @returns {HTMLElement} The Header element
 */
export const Header = () => {
  const header = document.createElement("header");
  header.className =
    "sticky top-0 z-50 layout-bg border-b border-gray-200 dark:border-gray-800";

  const headerInstance = new HeaderController(header);
  headerInstance.init();

  return header;
};

/**
 * Header Controller Class
 * Manages header rendering, navigation, theme switching, and mobile menu interactions
 */
class HeaderController {
  /**
   * Initialize Header controller with element reference
   * @param {HTMLElement} element - The Header element
   */
  constructor(element) {
    this.element = element;
  }

  /**
   * Initialize the Header component
   * Sets up rendering, selectors, logo functionality, mobile menu, and event listeners
   */
  init() {
    this.render();
    this.setupSelectors();
    this.setupLogoFunctionality();
    this.setupMobileMenu();
    this.attachEventListeners();
  }

  /**
   * Render the Header structure
   * Creates navigation with logo, menu links, and selector containers
   */
  render() {
    this.element.innerHTML = `
      <nav class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center h-20">
          <div class="flex items-center">
            <a href="#top" class="flex items-center logo-link pl-4 xl:pl-0">
              <img id="header-logo" 
                   src="./assets/img/logo/nuwault_logo_horizontal_dark_360px.png" 
                   alt="${t('header.logo.alt')}" 
                   class="h-12 w-auto transition-opacity duration-200">
            </a>
          </div>
          
          <div class="hidden md:flex items-center space-x-8">
            <a href="#generator" class="text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              ${t('header.navigation.generator')}
            </a>
            <a href="#features" class="text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              ${t('header.navigation.features')}
            </a>
            <a href="#user-guide" class="text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              ${t('header.navigation.userGuide')}
            </a>
            <a href="#faq" class="text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
              ${t('header.navigation.faq')}
            </a>
          </div>
          
          <div class="flex items-center">
            <div class="hidden md:flex items-center space-x-3">
              <div id="language-selector-container"></div>
              <div id="theme-selector-container"></div>
            </div>
            
            <div class="flex md:hidden items-center">
              <div id="language-selector-container-mobile"></div>
              <div id="theme-selector-container-mobile"></div>
              
              <button id="mobile-menu-button" class="p-2 rounded-lg text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-0.5">
                <svg id="menu-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                <svg id="close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-800">
          <div class="py-3 space-y-1">
            <a href="#generator" class="mobile-menu-link block px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors font-medium">
              ${t('header.navigation.generator')}
            </a>
            <a href="#features" class="mobile-menu-link block px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors font-medium">
              ${t('header.navigation.features')}
            </a>
            <a href="#user-guide" class="mobile-menu-link block px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors font-medium">
              ${t('header.navigation.userGuide')}
            </a>
            <a href="#faq" class="mobile-menu-link block px-3 py-2 text-gray-800 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors font-medium">
              ${t('header.navigation.faq')}
            </a>
          </div>
        </div>
      </nav>
    `;
  }

  /**
   * Setup theme and language selectors
   * Initializes selectors for both desktop and mobile layouts
   */
  setupSelectors() {
    const languageSelectorContainer = this.element.querySelector(
      "#language-selector-container"
    );
    const languageSelectorContainerMobile = this.element.querySelector(
      "#language-selector-container-mobile"
    );
    const languageSelector = new LanguageSelector();
    const languageSelectorMobile = new LanguageSelector();
    
    languageSelectorContainer.appendChild(languageSelector.render());
    languageSelectorContainerMobile.appendChild(languageSelectorMobile.render());

    const themeSelectorContainer = this.element.querySelector(
      "#theme-selector-container"
    );
    const themeSelectorContainerMobile = this.element.querySelector(
      "#theme-selector-container-mobile"
    );
    
    themeSelectorContainer.appendChild(ThemeSelector());
    themeSelectorContainerMobile.appendChild(ThemeSelector());
  }

  /**
   * Setup logo functionality
   * Handles theme-based logo switching and click behavior for page refresh
   */
  setupLogoFunctionality() {
    const logoElement = this.element.querySelector("#header-logo");
    const updateLogo = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const logoSrc = isDark
        ? "./assets/img/logo/nuwault_logo_horizontal_dark_360px.png"
        : "./assets/img/logo/nuwault_logo_horizontal_light_360px.png";
      
      logoElement.src = logoSrc;
    };

    // Initialize logo based on current theme
    updateLogo();

    // Watch for theme changes — disconnect previous observer before re-attaching
    if (this._logoObserver) {
      this._logoObserver.disconnect();
    }
    this._logoObserver = new MutationObserver(() => {
      updateLogo();
    });
    this._logoObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Logo click functionality: smooth scroll to top followed by page refresh
    const logoLink = this.element.querySelector(".logo-link");
    logoLink.addEventListener("click", (e) => {
      e.preventDefault();
      
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      // Delay page refresh to allow smooth scroll completion (800ms)
      setTimeout(() => {
        window.location.reload();
      }, 800);
    });
  }

  /**
   * Setup mobile menu functionality
   * Handles mobile menu toggle and navigation link interactions
   */
  setupMobileMenu() {
    const mobileMenuButton = this.element.querySelector("#mobile-menu-button");
    const mobileMenu = this.element.querySelector("#mobile-menu");
    const menuIcon = this.element.querySelector("#menu-icon");
    const closeIcon = this.element.querySelector("#close-icon");
    const mobileMenuLinks = this.element.querySelectorAll(".mobile-menu-link");

    const toggleMobileMenu = () => {
      const isHidden = mobileMenu.classList.contains("hidden");

      if (isHidden) {
        mobileMenu.classList.remove("hidden");
        menuIcon.classList.add("hidden");
        closeIcon.classList.remove("hidden");
      } else {
        mobileMenu.classList.add("hidden");
        menuIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
      }
    };

    mobileMenuButton.addEventListener("click", toggleMobileMenu);

    // Auto-close mobile menu when navigation links are clicked
    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        menuIcon.classList.remove("hidden");
        closeIcon.classList.add("hidden");
      });
    });
  }

  /**
   * Attach event listeners for component interactions
   * Handles language change events and re-initializes components
   */
  attachEventListeners() {
    // Re-render and reinitialize all components when language changes
    window.addEventListener('languageChanged', () => {
      this.render();
      this.setupSelectors();
      this.setupLogoFunctionality();
      this.setupMobileMenu();
    });
  }
}
