/**
 * PasswordGenerator Component
 * 
 * Advanced password generator with keyword-based generation, real-time
 * strength analysis, customizable character sets, and sophisticated
 * animation system. Features auto-generation, masking capabilities,
 * and responsive mobile-first design with touch support.
 * 
 * @author NuwaX
 */
import { generatePassword } from '@nuwax-io/nuwault-core';
import { SECURITY_CONFIG, DEFAULT_PASSWORD_OPTIONS, CHARACTER_SETS, KEYWORD_MANAGEMENT_OPTIONS } from '../utils/config.js';
import { toast } from '../utils/toast.js';
import { logger } from '../utils/logger.js';
import { KeywordChips } from './KeywordChips.js';
import { PasswordStrength } from './PasswordStrength.js';
import { t } from '../utils/i18n.js';

/**
 * PasswordGenerator Class
 * 
 * Comprehensive password generation system with advanced features:
 * - Keyword-based password generation with salt integration
 * - Real-time animated password generation with smooth transitions
 * - Configurable character sets and length constraints
 * - Auto-generation with debouncing and validation
 * - Password masking and strength analysis
 * - Mobile-optimized touch interactions and responsive design
 * - Debug utilities for mobile touch events
 */
export class PasswordGenerator {
  /**
   * Initialize the PasswordGenerator with default configuration
   */
  constructor() {
    // Load saved password length from localStorage or use default
    const savedLength = this.loadPasswordLength();
    
    this.options = {
      masterSalt: SECURITY_CONFIG.appKey,
      length: savedLength,
      includeUppercase: DEFAULT_PASSWORD_OPTIONS.includeUppercase,
      includeLowercase: DEFAULT_PASSWORD_OPTIONS.includeLowercase,
      includeNumbers: DEFAULT_PASSWORD_OPTIONS.includeNumbers,
      includeSymbols: DEFAULT_PASSWORD_OPTIONS.includeSymbols
    };
    this.element = null;
    this.isAnimating = false;
    this.animationFrameId = null;
    this.autoGenerateTimeout = null;
    this.lengthSliderTimeout = null;
    this.debounceDelay = 50;
    this.lengthSliderDelay = 1500; // 1.5 second delay for length slider
    this.keywordInput = '';
    this.maskKeywords = KEYWORD_MANAGEMENT_OPTIONS.maskKeywords;
    this.autoGenerate = KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword;
    this.maskPassword = KEYWORD_MANAGEMENT_OPTIONS.maskPassword;
    this.originalPassword = '';
    
    this.keywordChips = new KeywordChips({
      maskKeywords: this.maskKeywords,
      onKeywordChange: (keywords) => this.handleKeywordChange(keywords)
    });
    
    this.passwordStrength = new PasswordStrength();
  }

  /**
   * Load password length from localStorage
   * 
   * @returns {number} Saved password length or default value
   */
  loadPasswordLength() {
    try {
      const savedLength = localStorage.getItem('nuwault-password-length');
      
      if (savedLength) {
        const length = parseInt(savedLength, 10);
        
        // Validate that the saved length is within allowed range
        if (!isNaN(length) && 
            length >= SECURITY_CONFIG.minPasswordLength && 
            length <= SECURITY_CONFIG.maxPasswordLength) {
          logger.info('[PasswordGenerator] Loaded saved password length:', length);
          return length;
        }
      }
    } catch (error) {
      logger.warn('[PasswordGenerator] Failed to load password length from localStorage:', error);
    }
    
    // Return default length if no valid saved value exists
    return SECURITY_CONFIG.defaultPasswordLength;
  }

  /**
   * Save password length to localStorage
   * 
   * @param {number} length - Password length to save
   */
  savePasswordLength(length) {
    try {
      if (length >= SECURITY_CONFIG.minPasswordLength && 
          length <= SECURITY_CONFIG.maxPasswordLength) {
        localStorage.setItem('nuwault-password-length', length.toString());
        logger.info('[PasswordGenerator] Saved password length:', length);
      }
    } catch (error) {
      logger.warn('[PasswordGenerator] Failed to save password length to localStorage:', error);
    }
  }

  /**
   * Generate complete HTML structure for password generator interface
   * 
   * @returns {HTMLElement} The rendered password generator component
   */
  render() {
    const html = `
      <div class="card-bg rounded-xl shadow-lg p-6 space-y-6">
        <div class="space-y-4">
          <form id="keyword-form" class="flex gap-3" action="javascript:void(0);">
            <input type="text" 
                   id="keyword-input" 
                   value="${this.keywordInput}" 
                   class="input-field flex-1" 
                   placeholder="${t('password.generator.keywordInput.placeholder')}"
                   autocomplete="off"
                   inputmode="text"
                   enterkeyhint="done">
            <button type="submit" 
                    id="add-keyword-btn"
                    class="px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md dark:hover:shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer">
              ${t('password.generator.keywordInput.addButton')}
            </button>
          </form>

          <div id="keywords-container" class="keywords-container min-h-[48px] flex flex-wrap items-start gap-2">
            ${this.keywordChips.renderKeywordChips()}
          </div>
          <div class="flex flex-wrap gap-4 text-sm">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" id="mask-keywords" ${this.maskKeywords ? 'checked' : ''} 
                     class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="text-gray-700 dark:text-gray-300">${t('password.generator.options.maskKeywords')}</span>
            </label>
            <label class="flex items-center space-x-2 ${KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}">
              <input type="checkbox" id="auto-generate" 
                     ${this.autoGenerate && KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword ? 'checked' : ''} 
                     ${!KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword ? 'disabled' : ''}
                     class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 ${!KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword ? 'opacity-50 cursor-not-allowed' : ''}">
              <span class="text-gray-700 dark:text-gray-300">
                ${t('password.generator.options.autoGenerate')}
                ${!KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword ? `<span class="text-xs text-gray-500 dark:text-gray-400 ml-1">${t('password.generator.options.autoGenerateDisabled')}</span>` : ''}
              </span>
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              ${t('password.generator.options.passwordLength')}
            </label>
            <input type="number" id="length-input" 
                   min="${SECURITY_CONFIG.minPasswordLength}" 
                   max="${SECURITY_CONFIG.maxPasswordLength}" 
                   value="${this.options.length}" 
                   autocomplete="off"
                   class="input-field !w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
          </div>
          <input type="range" id="length-slider" min="${SECURITY_CONFIG.minPasswordLength}" max="${SECURITY_CONFIG.maxPasswordLength}" value="${this.options.length}" 
                 class="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700">
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-800 dark:text-gray-300">
            ${t('password.generator.characterTypes.title')}
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" id="uppercase" ${this.options.includeUppercase ? 'checked' : ''} 
                     class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="text-sm text-gray-800 dark:text-gray-300">${t('password.generator.characterTypes.uppercase')}</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" id="lowercase" ${this.options.includeLowercase ? 'checked' : ''} 
                     class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="text-sm text-gray-800 dark:text-gray-300">${t('password.generator.characterTypes.lowercase')}</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" id="numbers" ${this.options.includeNumbers ? 'checked' : ''} 
                     class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="text-sm text-gray-800 dark:text-gray-300">${t('password.generator.characterTypes.numbers')}</span>
            </label>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" id="symbols" ${this.options.includeSymbols ? 'checked' : ''} 
                     class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="text-sm text-gray-800 dark:text-gray-300">${t('password.generator.characterTypes.symbols')}</span>
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-800 dark:text-gray-300">
            ${t('password.generator.generatedPassword.title')}
          </label>
          <div class="flex gap-3 items-stretch">
            <div class="flex-1">
              <textarea id="password-output" readonly rows="1"
                        class="input-field font-mono password-output-field resize-none" 
                        placeholder="${t('password.generator.generatedPassword.placeholder.default')}" autocomplete="off"></textarea>
            </div>
            <button id="copy-password" 
                    class="px-4 py-2 bg-primary-500 hover:bg-primary-400 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-md text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md dark:hover:shadow-lg flex items-center justify-center h-auto cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    title="${t('password.generator.generatedPassword.copyButton')}">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"></rect>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
              </svg>
              ${t('password.generator.generatedPassword.copyButton')}
            </button>
          </div>
          
          <div class="flex flex-wrap gap-4 text-sm mt-2">
            <label class="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" id="mask-password" ${this.maskPassword ? 'checked' : ''} 
                     class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
              <span class="text-gray-700 dark:text-gray-300">${t('password.generator.generatedPassword.maskPassword')}</span>
            </label>
          </div>
          
          ${this.passwordStrength.renderPasswordStrengthMeter()}
          <div id="manual-generate-container" class="mt-3 hidden">
            <button id="manual-generate-btn" 
                    class="w-full btn-primary flex items-center justify-center space-x-2 py-3">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>${t('password.generator.generatedPassword.generateButton')}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    this.element = tempDiv.firstElementChild;
    
    this.attachEventListeners();
    
    const keywordsContainer = this.element.querySelector('#keywords-container');
    this.keywordChips.updateKeywordChips(keywordsContainer, false);
    
    setTimeout(() => {
      this.updateValidationState();
      this.updateAddButtonState();
      this.updateCopyButtonState();
      this.updateManualGenerateButtonVisibility();

    }, 0);
    
    return this.element;
  }

  /**
   * Handle keyword changes from KeywordChips component
   * 
   * @param {Array} keywords - Updated array of keywords
   */
  handleKeywordChange(keywords) {
    if (KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword && this.autoGenerate) {
      if (this.autoGenerateTimeout) {
        clearTimeout(this.autoGenerateTimeout);
      }
      this.performPasswordGeneration();
    } else {
      this.updateValidationState();
    }
  }

  /**
   * Attach comprehensive event listeners for all interactive elements
   * Includes advanced touch handling, keyboard navigation, and mobile optimization
   */
  attachEventListeners() {
    const lengthSlider = this.element.querySelector('#length-slider');
    const lengthInput = this.element.querySelector('#length-input');
    
    let isDragging = false;
    let lastValue = this.options.length;
    
    const isThumbInteraction = (clientX, sliderElement) => {
      const rect = sliderElement.getBoundingClientRect();
      const percentage = (sliderElement.value - sliderElement.min) / (sliderElement.max - sliderElement.min);
      const thumbPosition = percentage * rect.width;
      const clickPosition = clientX - rect.left;
      const thumbWidth = 24;
      
      return Math.abs(clickPosition - thumbPosition) <= thumbWidth;
    };
    
    lengthSlider.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
    
    lengthSlider.addEventListener('mousedown', (e) => {
      if (isThumbInteraction(e.clientX, lengthSlider)) {
        isDragging = true;
        lastValue = parseInt(lengthSlider.value);
      } else {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    });
    
    lengthSlider.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (isThumbInteraction(touch.clientX, lengthSlider)) {
          isDragging = true;
          lastValue = parseInt(lengthSlider.value);
        } else {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }, { passive: false });
    
    lengthSlider.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    lengthSlider.addEventListener('touchend', () => {
      isDragging = false;
    });
    
    lengthSlider.addEventListener('mouseleave', () => {
      isDragging = false;
    });
    
    lengthSlider.addEventListener('touchcancel', () => {
      isDragging = false;
    });
    
    lengthSlider.addEventListener('input', (e) => {
      const currentValue = parseInt(e.target.value);
      
      if (isDragging || currentValue !== lastValue) {
        this.options.length = currentValue;
        lengthInput.value = this.options.length;
        lastValue = currentValue;
        
        // Save the new length value to localStorage
        this.savePasswordLength(currentValue);
        
        // Show visual feedback that generation is pending
        const passwordOutput = this.element.querySelector('#password-output');
        if (passwordOutput && passwordOutput.value.trim()) {
          passwordOutput.style.opacity = '0.6';
          passwordOutput.style.transition = 'opacity 0.2s ease';
        }
        
        // Clear any existing timeout
        if (this.lengthSliderTimeout) {
          clearTimeout(this.lengthSliderTimeout);
        }
        
        // Set a longer delay for length slider changes
        this.lengthSliderTimeout = setTimeout(() => {
          // Restore opacity before generating
          if (passwordOutput) {
            passwordOutput.style.opacity = '1';
          }
          this.autoGeneratePassword();
        }, this.lengthSliderDelay);
      }
    });

    lengthSlider.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) {
        isDragging = true;
      }
    });

    lengthInput.addEventListener('input', (e) => {
      let inputValue = parseInt(e.target.value);
      
      if (e.target.value === '' || isNaN(inputValue)) {
        return;
      }
      
      if (inputValue > SECURITY_CONFIG.maxPasswordLength) {
        inputValue = SECURITY_CONFIG.maxPasswordLength;
        e.target.value = inputValue;
      }
      
      this.options.length = inputValue;
      lengthSlider.value = inputValue;
      lastValue = inputValue;
      
      // Save the new length value to localStorage
      this.savePasswordLength(inputValue);
      
      // Clear any existing timeout
      if (this.lengthSliderTimeout) {
        clearTimeout(this.lengthSliderTimeout);
      }
      
      // Set a longer delay for length input changes
      this.lengthSliderTimeout = setTimeout(() => {
        this.autoGeneratePassword();
      }, this.lengthSliderDelay);
    });

    lengthInput.addEventListener('focus', (e) => {
      e.target.select();
    });

    lengthInput.addEventListener('blur', (e) => {
      let inputValue = parseInt(e.target.value);
      
      if (e.target.value === '' || isNaN(inputValue)) {
        inputValue = this.options.length || SECURITY_CONFIG.defaultPasswordLength;
      } else if (inputValue < SECURITY_CONFIG.minPasswordLength) {
        inputValue = SECURITY_CONFIG.minPasswordLength;
      } else if (inputValue > SECURITY_CONFIG.maxPasswordLength) {
        inputValue = SECURITY_CONFIG.maxPasswordLength;
      }
      
      e.target.value = inputValue;
      this.options.length = inputValue;
      lengthSlider.value = inputValue;
      lastValue = inputValue;
      
      // Save the final validated length value to localStorage
      this.savePasswordLength(inputValue);
      
      // Clear any existing timeout
      if (this.lengthSliderTimeout) {
        clearTimeout(this.lengthSliderTimeout);
      }
      
      // Set a longer delay for length input blur
      this.lengthSliderTimeout = setTimeout(() => {
        this.autoGeneratePassword();
      }, this.lengthSliderDelay);
    });

    const checkboxes = ['uppercase', 'lowercase', 'numbers', 'symbols'];
    checkboxes.forEach(type => {
      this.element.querySelector(`#${type}`).addEventListener('change', (e) => {
        this.options[`include${type.charAt(0).toUpperCase() + type.slice(1)}`] = e.target.checked;
        
        this.updateValidationState();
        this.autoGeneratePassword();
      });
    });

    this.element.querySelector('#copy-password').addEventListener('click', () => {
      this.copyPassword();
    });

    const passwordOutput = this.element.querySelector('#password-output');
    passwordOutput.addEventListener('click', () => {
      if (passwordOutput.value.trim()) {
        passwordOutput.select();
      }
    });

    passwordOutput.addEventListener('focus', () => {
      if (passwordOutput.value.trim()) {
        passwordOutput.select();
      }
    });
    
    passwordOutput.addEventListener('input', () => {
      this.autoResizeTextarea(passwordOutput);
    });

    const keywordInput = this.element.querySelector('#keyword-input');
    const addKeywordBtn = this.element.querySelector('#add-keyword-btn');
    
    keywordInput.addEventListener('input', (e) => {
      if (e.target.value.includes('\n')) {
        e.target.value = e.target.value.replace(/\n/g, '');
        this.keywordInput = e.target.value.trim();
        if (this.keywordInput) {
          this.addKeyword();
        }
        return;
      }
      this.keywordInput = e.target.value;
      this.updateAddButtonState();
      this.updateInputVisualFeedback(e.target);
    });

    keywordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        this.addKeyword();
      }
    });

    addKeywordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.addKeyword();
    });

    const keywordForm = this.element.querySelector('#keyword-form');
    keywordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addKeyword();
    });

    const maskKeywordsCheckbox = this.element.querySelector('#mask-keywords');
    maskKeywordsCheckbox.addEventListener('change', (e) => {
      this.maskKeywords = e.target.checked;
      this.keywordChips.setMaskKeywords(this.maskKeywords);
      const keywordsContainer = this.element.querySelector('#keywords-container');
      this.keywordChips.updateKeywordChips(keywordsContainer, false);
    });

    const autoGenerateCheckbox = this.element.querySelector('#auto-generate');
    autoGenerateCheckbox.addEventListener('change', (e) => {
      if (!KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword) {
        e.target.checked = false;
        this.autoGenerate = false;
        toast.warning('Auto-generation is disabled in configuration');
        return;
      }
      
      this.autoGenerate = e.target.checked;
      this.updateManualGenerateButtonVisibility();
      if (this.autoGenerate) {
        this.autoGeneratePassword();
      }
    });

    const manualGenerateBtn = this.element.querySelector('#manual-generate-btn');
    manualGenerateBtn.addEventListener('click', () => {
      this.performPasswordGeneration();
    });

    const maskPasswordCheckbox = this.element.querySelector('#mask-password');
    maskPasswordCheckbox.addEventListener('change', (e) => {
      this.maskPassword = e.target.checked;
      this.updatePasswordDisplay();
    });
    
    window.addEventListener('resize', () => {
      this.updateValidationState();
      
      const passwordOutput = this.element.querySelector('#password-output');
      if (passwordOutput && passwordOutput.value) {
        this.autoResizeTextarea(passwordOutput);
      }
    });
  }

  /**
   * Add new keyword(s) from input field
   * Supports both single keywords and comma-separated multiple keywords
   */
  addKeyword() {
    const trimmedInput = this.keywordInput.trim();
    if (!trimmedInput) return;
    
    const keywordContainer = this.element.querySelector('#keywords-container');
    
    let success = false;
    if (trimmedInput.includes(',')) {
      success = this.keywordChips.addMultipleKeywords(trimmedInput, keywordContainer);
    } else {
      success = this.keywordChips.addSingleKeyword(trimmedInput, keywordContainer);
    }
    
    if (success) {
      this.keywordInput = '';
      const keywordInputElement = this.element.querySelector('#keyword-input');
      if (keywordInputElement) {
        keywordInputElement.value = '';
        keywordInputElement.blur();
        this.updateAddButtonState();
        this.updateInputVisualFeedback(keywordInputElement);
      }
    }
  }

  /**
   * Update add button state based on current input value
   * Enables/disables button and applies visual feedback
   */
  updateAddButtonState() {
    const addKeywordBtn = this.element.querySelector('#add-keyword-btn');
    const trimmedInput = this.keywordInput.trim();
    
    let hasValidInput = false;
    const currentKeywords = this.keywordChips.getKeywords();
    
    if (trimmedInput.length >= 1) {
      if (trimmedInput.includes(',')) {
        const keywords = trimmedInput.split(',')
          .map(keyword => keyword.trim())
          .filter(keyword => keyword.length >= 1 && !currentKeywords.includes(keyword));
        hasValidInput = keywords.length > 0;
      } else {
        hasValidInput = !currentKeywords.includes(trimmedInput);
      }
    }
    
    if (hasValidInput) {
      addKeywordBtn.disabled = false;
      addKeywordBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      addKeywordBtn.classList.add('cursor-pointer', 'hover:bg-primary-400', 'hover:shadow-md', 'dark:hover:bg-primary-700', 'dark:hover:shadow-lg');
    } else {
      addKeywordBtn.disabled = true;
      addKeywordBtn.classList.add('opacity-50', 'cursor-not-allowed');
      addKeywordBtn.classList.remove('cursor-pointer', 'hover:bg-primary-400', 'hover:shadow-md', 'dark:hover:bg-primary-700', 'dark:hover:shadow-lg');
    }
  }

  /**
   * Update visual feedback for input field based on keyword validation
   * 
   * @param {HTMLElement} inputElement - The keyword input element
   */
  updateInputVisualFeedback(inputElement) {
    const trimmedInput = this.keywordInput.trim();
    const currentKeywords = this.keywordChips.getKeywords();
    
    if (trimmedInput.includes(',')) {
      const keywords = trimmedInput.split(',')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
      
      const validKeywords = keywords.filter(keyword => !currentKeywords.includes(keyword));
      
      if (validKeywords.length > 0) {
        inputElement.classList.add('border-blue-300', 'dark:border-blue-500');
        inputElement.classList.remove('border-red-300', 'dark:border-red-500');
      } else {
        inputElement.classList.add('border-red-300', 'dark:border-red-500');
        inputElement.classList.remove('border-blue-300', 'dark:border-blue-500');
      }
    } else {
      inputElement.classList.remove('border-blue-300', 'dark:border-blue-500', 'border-red-300', 'dark:border-red-500');
    }
  }

  /**
   * Update copy button state based on password availability
   */
  updateCopyButtonState() {
    const copyButton = this.element.querySelector('#copy-password');
    if (!copyButton) return;
    
    const hasPassword = this.originalPassword && this.originalPassword.trim().length > 0;
    
    if (hasPassword) {
      copyButton.disabled = false;
      copyButton.classList.remove('opacity-50', 'cursor-not-allowed');
      copyButton.classList.add('cursor-pointer', 'hover:bg-primary-400', 'hover:shadow-md', 'dark:hover:bg-primary-700', 'dark:hover:shadow-lg');
    } else {
      copyButton.disabled = true;
      copyButton.classList.add('opacity-50', 'cursor-not-allowed');
      copyButton.classList.remove('cursor-pointer', 'hover:bg-primary-400', 'hover:shadow-md', 'dark:hover:bg-primary-700', 'dark:hover:shadow-lg');
    }
  }

  /**
   * Auto-generate password with debouncing to prevent excessive calls
   */
  autoGeneratePassword() {
    if (!KEYWORD_MANAGEMENT_OPTIONS.autoGeneratePassword || !this.autoGenerate) {
      return;
    }
    
    if (this.isAnimating) {
      return;
    }
    
    // Clear any existing timeouts
    if (this.autoGenerateTimeout) {
      clearTimeout(this.autoGenerateTimeout);
    }
    if (this.lengthSliderTimeout) {
      clearTimeout(this.lengthSliderTimeout);
    }
    
    const isMobile = window.innerWidth <= 768;
    const debounceDelay = isMobile ? 200 : this.debounceDelay;
    
    this.autoGenerateTimeout = setTimeout(() => {
      this.performPasswordGeneration();
    }, debounceDelay);
  }
  
  /**
   * Core password generation function with validation and error handling
   */
  async performPasswordGeneration(retryCount = 0) {
    if (this.isAnimating) {
      return;
    }

    if (retryCount >= 3) {
      logger.warn('[PasswordGenerator] Max retries reached, giving up');
      this.setPassword('');
      return;
    }
    
    try {
      const keywords = this.keywordChips.getKeywords();
      const validKeywords = keywords.filter(keyword => keyword.trim());
      
      const totalCharacters = validKeywords.join('').trim().length;
      const hasMinimumLength = totalCharacters >= 3;
      
      // Validate that at least one character type is selected
      const hasValidCharacterTypes = this.options.includeUppercase || 
                                    this.options.includeLowercase || 
                                    this.options.includeNumbers || 
                                    this.options.includeSymbols;
      
      if (validKeywords.length > 0 && hasMinimumLength && hasValidCharacterTypes) {
        // Generate password with current options
        const password = await generatePassword(validKeywords, this.options);
        
        // Validate the generated password
        if (password && password.length === this.options.length) {
          // Check if password contains required character types
          let hasUppercase = false, hasLowercase = false, hasNumbers = false, hasSymbols = false;
          
          if (this.options.includeUppercase) {
            hasUppercase = /[A-Z]/.test(password);
          }
          if (this.options.includeLowercase) {
            hasLowercase = /[a-z]/.test(password);
          }
          if (this.options.includeNumbers) {
            hasNumbers = /[0-9]/.test(password);
          }
          if (this.options.includeSymbols) {
            hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
          }
          
          const isValidPassword = (!this.options.includeUppercase || hasUppercase) &&
                                 (!this.options.includeLowercase || hasLowercase) &&
                                 (!this.options.includeNumbers || hasNumbers) &&
                                 (!this.options.includeSymbols || hasSymbols);
          
          if (isValidPassword && !this.isAnimating) {
            await this.animatePasswordGeneration(password);
          } else {
            // Retry generation if password doesn't meet requirements
            logger.warn('[PasswordGenerator] Generated password does not meet requirements, retrying...');
            setTimeout(() => {
              this.performPasswordGeneration(retryCount + 1);
            }, 100);
          }
        } else {
          logger.error('[PasswordGenerator] Generated password length mismatch:', password?.length, 'expected:', this.options.length);
          this.setPassword('');
        }
      } else {
        this.setPassword('');
      }
    } catch (error) {
      logger.error('[PasswordGenerator] Password generation error:', error);
      this.setPassword('');
    }
  }

  /**
   * Auto-resize textarea based on content with mobile optimization
   * 
   * @param {HTMLTextAreaElement} textarea - The textarea element to resize
   */
  autoResizeTextarea(textarea) {
    if (!textarea) return;

    textarea.style.height = 'auto';

    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
    const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
    
    const contentHeight = textarea.scrollHeight;
    const minHeight = parseFloat(computedStyle.minHeight) || lineHeight * 1.5;
    
    const isMobile = window.innerWidth <= 768;
    const mobileMinHeight = isMobile ? parseFloat(computedStyle.minHeight) || 48 : minHeight;
    
    const maxMobileHeight = isMobile ? (lineHeight * 4) + paddingTop + paddingBottom : Infinity;
    
    const newHeight = Math.min(maxMobileHeight, Math.max(mobileMinHeight, contentHeight));
    textarea.style.height = `${newHeight}px`;

    if (isMobile) {
      textarea.style.overflowY = contentHeight > maxMobileHeight ? 'auto' : 'hidden';
    }
  }

  /**
   * Create animated password generation with smooth character transitions
   * 
   * @param {string} finalPassword - The final password to reveal
   */
  async animatePasswordGeneration(finalPassword) {
    if (this.isAnimating) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }

    this.isAnimating = true;
    const passwordOutput = this.element.querySelector('#password-output');
    
    passwordOutput.value = '';
    passwordOutput.placeholder = '';
    
    await this.setTextareaForAnimation(passwordOutput, finalPassword);
    
    let availableChars = '';
    if (this.options.includeUppercase) availableChars += CHARACTER_SETS.UPPERCASE;
    if (this.options.includeLowercase) availableChars += CHARACTER_SETS.LOWERCASE;
    if (this.options.includeNumbers) availableChars += CHARACTER_SETS.NUMBERS;
    if (this.options.includeSymbols) availableChars += CHARACTER_SETS.SYMBOLS;
    
    if (!availableChars) {
      availableChars = CHARACTER_SETS.LOWERCASE;
    }

    const animationDuration = 3500;
    const frameRate = 60;
    const totalFrames = Math.floor(animationDuration / (1000 / frameRate));
    let currentFrame = 0;

    const getRandomChar = () => {
      return availableChars[Math.floor(Math.random() * availableChars.length)];
    };

    const animate = () => {
      if (!this.isAnimating) return;

      const progress = currentFrame / totalFrames;
      const revealedCount = Math.floor(progress * finalPassword.length);
      
      let animatedPassword = '';
      
      for (let i = 0; i < finalPassword.length; i++) {
        if (i < revealedCount) {
          animatedPassword += finalPassword[i];
        } else {
          animatedPassword += getRandomChar();
        }
      }
      
      passwordOutput.value = animatedPassword;
      
      currentFrame++;
      
      if (currentFrame <= totalFrames) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        this.animationFrameId = null;
        
        setTimeout(() => {
          this.setPassword(finalPassword);
        }, 50);
      }
    };

    animate();
  }

  /**
   * Pre-calculate and set textarea dimensions to prevent height jumping during animation
   * 
   * @param {HTMLTextAreaElement} textarea - The textarea element
   * @param {string} finalPassword - The final password to calculate dimensions for
   */
  async setTextareaForAnimation(textarea, finalPassword) {
    const originalValue = textarea.value;
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const tempTextarea = textarea.cloneNode(true);
    tempTextarea.style.position = 'absolute';
    tempTextarea.style.top = '-9999px';
    tempTextarea.style.left = '-9999px';
    tempTextarea.style.visibility = 'hidden';
    tempTextarea.style.height = 'auto';
    tempTextarea.style.minHeight = 'auto';
    tempTextarea.value = finalPassword;
    
    document.body.appendChild(tempTextarea);
    
    const computedStyle = window.getComputedStyle(tempTextarea);
    const lineHeight = parseInt(computedStyle.lineHeight) || 24;
    const paddingTop = parseInt(computedStyle.paddingTop) || 8;
    const paddingBottom = parseInt(computedStyle.paddingBottom) || 8;
    const borderTop = parseInt(computedStyle.borderTopWidth) || 1;
    const borderBottom = parseInt(computedStyle.borderBottomWidth) || 1;
    
    const totalPadding = paddingTop + paddingBottom + borderTop + borderBottom;
    const scrollHeight = tempTextarea.scrollHeight;
    const minRows = 1;
    const maxRows = 6;
    const minHeight = (lineHeight * minRows) + totalPadding;
    const maxHeight = (lineHeight * maxRows) + totalPadding;
    
    let finalHeight;
    if (scrollHeight <= minHeight) {
      finalHeight = minHeight;
    } else if (scrollHeight >= maxHeight) {
      finalHeight = maxHeight;
    } else {
      finalHeight = scrollHeight;
    }
    
    document.body.removeChild(tempTextarea);
    
    textarea.style.transition = 'height 0.1s ease-out, min-height 0.1s ease-out';
    
    textarea.style.height = finalHeight + 'px';
    textarea.style.minHeight = finalHeight + 'px';
    
    const finalRows = Math.max(minRows, Math.ceil((finalHeight - totalPadding) / lineHeight));
    textarea.rows = finalRows;
    
    textarea.style.overflowY = finalHeight >= maxHeight ? 'auto' : 'hidden';
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (Math.abs(newScrollTop - currentScrollTop) > 5) {
      window.scrollTo(0, currentScrollTop);
    }
    
    textarea.style.transition = '';
  }

  /**
   * Copy the original password to clipboard with visual feedback
   */
  copyPassword() {
    const copyButton = this.element.querySelector('#copy-password');

    if (copyButton.disabled) {
      return;
    }

    if (this.originalPassword && this.originalPassword.trim().length > 0) {
      navigator.clipboard.writeText(this.originalPassword).then(() => {
        const originalStyle = copyButton.style.backgroundColor;
        
        copyButton.style.backgroundColor = '#10b981';
        
        toast.success(t('password.generator.toasts.passwordCopied'));
        
        setTimeout(() => {
          copyButton.style.backgroundColor = originalStyle;
        }, 1000);
      }).catch(() => {
        toast.error(t('password.generator.toasts.copyFailed'));
      });
    } else {
      toast.warning(t('password.generator.toasts.noPasswordToCopy'));
    }
  }

  /**
   * Validate keywords for minimum length requirements
   * 
   * @returns {Object} Validation results with hasValidKeyword and totalCharacters
   */
  validateKeywords() {
    const keywords = this.keywordChips.getKeywords();
    let hasValidKeyword = false;
    let totalCharacters = 0;
    
    keywords.forEach((keyword) => {
      const trimmedKeyword = keyword.trim();
      
      if (trimmedKeyword.length >= 3) {
        hasValidKeyword = true;
      }
      
      totalCharacters += trimmedKeyword.length;
    });
    
    return { hasValidKeyword, totalCharacters };
  }

  /**
   * Update placeholder text based on validation state and device type
   */
  updateValidationState() {
    const { hasValidKeyword, totalCharacters } = this.validateKeywords();
    const passwordOutput = this.element.querySelector('#password-output');
    const keywords = this.keywordChips.getKeywords();
    
    const isMobile = window.innerWidth <= 768;
    
    if (keywords.length === 0) {
      passwordOutput.placeholder = isMobile 
        ? t('password.generator.generatedPassword.placeholder.mobile.default')
        : t('password.generator.generatedPassword.placeholder.default');
    } else if (totalCharacters === 0) {
      passwordOutput.placeholder = isMobile 
        ? t('password.generator.generatedPassword.placeholder.mobile.empty')
        : t('password.generator.generatedPassword.placeholder.emptyKeywords');
    } else if (!hasValidKeyword) {
      passwordOutput.placeholder = isMobile 
        ? t('password.generator.generatedPassword.placeholder.mobile.shortKeywords')
        : t('password.generator.generatedPassword.placeholder.shortKeywords');
    } else {
      passwordOutput.placeholder = isMobile 
        ? t('password.generator.generatedPassword.placeholder.mobile.ready')
        : t('password.generator.generatedPassword.placeholder.ready');
    }
  }

  /**
   * Show/hide manual generate button based on auto-generate state
   */
  updateManualGenerateButtonVisibility() {
    const manualGenerateContainer = this.element.querySelector('#manual-generate-container');
    if (this.autoGenerate) {
      manualGenerateContainer.classList.add('hidden');
    } else {
      manualGenerateContainer.classList.remove('hidden');
    }
  }

  /**
   * Update password display based on mask setting with smooth transitions
   */
  updatePasswordDisplay() {
    const passwordOutput = this.element.querySelector('#password-output');
    if (!passwordOutput) return;
    
    if (this.originalPassword) {
      passwordOutput.style.transition = 'height 0.2s ease-out, min-height 0.2s ease-out';
      
      if (this.maskPassword) {
        passwordOutput.value = this.maskPasswordString(this.originalPassword);
      } else {
        passwordOutput.value = this.originalPassword;
      }
      
      this.autoResizeTextarea(passwordOutput);
      
      setTimeout(() => {
        passwordOutput.style.transition = '';
      }, 200);
    }
  }

  /**
   * Convert password to asterisks while preserving length
   * 
   * @param {string} password - The password to mask
   * @returns {string} Masked password string
   */
  maskPasswordString(password) {
    if (!password) return '';
    
    return '*'.repeat(password.length);
  }

  /**
   * Store original password and update display with proper masking
   * 
   * @param {string} password - The password to set
   */
  setPassword(password) {
    this.originalPassword = password;
    const passwordOutput = this.element.querySelector('#password-output');
    
    if (!this.isAnimating) {
      passwordOutput.style.transition = 'height 0.2s ease-out, min-height 0.2s ease-out';
    }
    
    const currentPassword = password;
    
    if (this.maskPassword) {
      passwordOutput.value = this.maskPasswordString(currentPassword);
    } else {
      passwordOutput.value = currentPassword;
    }
    
    this.autoResizeTextarea(passwordOutput);
    
    if (!this.isAnimating) {
      setTimeout(() => {
        passwordOutput.style.transition = '';
      }, 200);
    }
    
    if (!currentPassword || currentPassword.trim().length === 0) {
      this.updateValidationState();
    } else {
      passwordOutput.placeholder = '';
    }
    
    requestAnimationFrame(() => {
      if (this.originalPassword === currentPassword) {
        this.passwordStrength.updatePasswordStrength(currentPassword, this.element);
        this.updateCopyButtonState();
      }
    });
  }

  /**
   * Enhanced mobile debugging utility with throttling for touch events
   * 
   * @param {Event} event - The touch event
   * @param {string} action - The action being performed
   */
  debugTouchEvents(event, action) {
    if (typeof window === 'undefined' || !window.location) return;
    
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    const debugEnabled = localStorage.getItem('nuwault-debug-touch') === 'true';
    
    if (!isDevelopment && !debugEnabled) return;
    
    if (this.debugLogThrottle) return;
    
    const currentState = {
      action,
      touchCount: event.touches ? event.touches.length : 0,
      isDragging: this.isTouchDragging,
      touchMoved: this.touchMoved,
      preventClick: this.touchPreventClick
    };
    
    const shouldLog = action === 'touchstart' || 
                      action === 'touchend' || 
                      action === 'touchcancel' ||
                      !this.lastDebugState ||
                      this.lastDebugState.isDragging !== currentState.isDragging ||
                      this.lastDebugState.action !== currentState.action;
    
    if (!shouldLog) return;
    
    if ((action === 'touchstart' || action === 'touchend') && event.touches && event.touches[0]) {
      currentState.x = Math.round(event.touches[0].clientX);
      currentState.y = Math.round(event.touches[0].clientY);
    } else if (action === 'touchend' && event.changedTouches && event.changedTouches[0]) {
      currentState.x = Math.round(event.changedTouches[0].clientX);
      currentState.y = Math.round(event.changedTouches[0].clientY);
    }
    
    console.log('[Touch Debug]', currentState);
    this.lastDebugState = { ...currentState };
    
    this.debugLogThrottle = true;
    setTimeout(() => {
      this.debugLogThrottle = false;
    }, 100);
  }
} 