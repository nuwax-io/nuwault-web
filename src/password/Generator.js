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
import { SECURITY_CONFIG, DEFAULT_PASSWORD_OPTIONS, KEYWORD_MANAGEMENT_OPTIONS, DEFAULT_SYMBOL_CATEGORIES, buildCharacterSets } from '../utils/config.js';
import { toast } from '../utils/toast.js';
import { logger } from '../utils/logger.js';
import { KeywordChips } from './KeywordChips.js';
import { PasswordStrength } from './PasswordStrength.js';
import { t } from '../utils/i18n.js';
import { GeneratorTemplate } from './GeneratorTemplate.js';
import { GeneratorAnimation } from './GeneratorAnimation.js';
import { GeneratorEvents } from './GeneratorEvents.js';

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
    this.symbolCategories = { ...DEFAULT_SYMBOL_CATEGORIES };
    this.excludeLookAlike = KEYWORD_MANAGEMENT_OPTIONS.excludeLookAlike;

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

  destroy() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this.autoGenerateTimeout) {
      clearTimeout(this.autoGenerateTimeout);
      this.autoGenerateTimeout = null;
    }
    if (this.lengthSliderTimeout) {
      clearTimeout(this.lengthSliderTimeout);
      this.lengthSliderTimeout = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isAnimating = false;
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
        const customCharacterSets = buildCharacterSets(this.symbolCategories, this.excludeLookAlike);
        const symbolsEnabled = Object.values(this.symbolCategories).some(Boolean);

        // Use object-form API so characterSets is forwarded to the core
        const result = await generatePassword({
          keywords: validKeywords,
          length: this.options.length,
          options: {
            includeUppercase: this.options.includeUppercase,
            includeLowercase: this.options.includeLowercase,
            includeNumbers:   this.options.includeNumbers,
            includeSymbols:   symbolsEnabled,
          },
          masterSalt:    this.options.masterSalt || null,
          characterSets: customCharacterSets,
        });
        const password = result.password;

        if (password && password.length === this.options.length) {
          // Set-based membership check — no regex escaping needed
          const inSet = (str, charset) => {
            const s = new Set(charset);
            for (const c of str) { if (s.has(c)) return true; }
            return false;
          };

          let hasUppercase = false, hasLowercase = false, hasNumbers = false, hasSymbols = false;

          if (this.options.includeUppercase) {
            hasUppercase = inSet(password, customCharacterSets.UPPERCASE);
          }
          if (this.options.includeLowercase) {
            hasLowercase = inSet(password, customCharacterSets.LOWERCASE);
          }
          if (this.options.includeNumbers) {
            hasNumbers = inSet(password, customCharacterSets.NUMBERS);
          }
          if (symbolsEnabled && customCharacterSets.SYMBOLS.length > 0) {
            hasSymbols = inSet(password, customCharacterSets.SYMBOLS);
          }

          const isValidPassword = (!this.options.includeUppercase || hasUppercase) &&
                                 (!this.options.includeLowercase || hasLowercase) &&
                                 (!this.options.includeNumbers || hasNumbers) &&
                                 (!symbolsEnabled || hasSymbols);

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
   * Copy the original password to clipboard with visual feedback
   */
  copyPassword() {
    const copyButton = this.element.querySelector('#copy-password');

    if (copyButton.disabled) {
      return;
    }

    if (this.originalPassword && this.originalPassword.trim().length > 0) {
      if (!navigator.clipboard) {
        toast.error(t('password.generator.toasts.copyFailed'));
        return;
      }
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

Object.assign(PasswordGenerator.prototype, GeneratorTemplate, GeneratorAnimation, GeneratorEvents);
