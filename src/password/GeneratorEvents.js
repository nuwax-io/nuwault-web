import { SECURITY_CONFIG, KEYWORD_MANAGEMENT_OPTIONS } from '../utils/config.js';
import { toast } from '../utils/toast.js';
import { t } from '../utils/i18n.js';

export const GeneratorEvents = {
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
  },

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

    // ── Keyword form (critical — registered first) ──────────────────
    const keywordInput = this.element.querySelector('#keyword-input');
    const addKeywordBtn = this.element.querySelector('#add-keyword-btn');
    const keywordForm = this.element.querySelector('#keyword-form');

    if (keywordInput) {
      keywordInput.addEventListener('input', (e) => {
        if (e.target.value.includes('\n')) {
          e.target.value = e.target.value.replace(/\n/g, '');
          this.keywordInput = e.target.value.trim();
          if (this.keywordInput) this.addKeyword();
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
    }
    if (addKeywordBtn) {
      addKeywordBtn.addEventListener('click', (e) => { e.preventDefault(); this.addKeyword(); });
    }
    if (keywordForm) {
      keywordForm.addEventListener('submit', (e) => { e.preventDefault(); this.addKeyword(); });
    }

    // ── Character type checkboxes ────────────────────────────────────
    const charTypeCheckboxes = ['uppercase', 'lowercase', 'numbers'];
    charTypeCheckboxes.forEach(type => {
      const el = this.element.querySelector(`#${type}`);
      if (!el) return;
      el.addEventListener('change', (e) => {
        this.options[`include${type.charAt(0).toUpperCase() + type.slice(1)}`] = e.target.checked;
        this.updateValidationState();
        this.autoGeneratePassword();
      });
    });

    // ── Symbol category checkboxes ───────────────────────────────────
    const symbolCheckboxMap = {
      'sym-logograms':   'logograms',
      'sym-braces':      'braces',
      'sym-dashes':      'dashes',
      'sym-punctuation': 'punctuation',
      'sym-quotes':      'quotes',
      'sym-math':        'math',
      'sym-extended':    'extended',
    };
    Object.entries(symbolCheckboxMap).forEach(([id, key]) => {
      const el = this.element.querySelector(`#${id}`);
      if (!el) return;
      el.addEventListener('change', (e) => {
        this.symbolCategories[key] = e.target.checked;
        this.options.includeSymbols = Object.values(this.symbolCategories).some(Boolean);
        this.updateValidationState();
        this.autoGeneratePassword();
      });
    });

    const lookAlikeEl = this.element.querySelector('#exclude-look-alike');
    if (lookAlikeEl) {
      lookAlikeEl.addEventListener('change', (e) => {
        this.excludeLookAlike = e.target.checked;
        this.updateValidationState();
        this.autoGeneratePassword();
      });
    }

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
        toast.warning(t('password.generator.options.autoGenerateDisabled'));
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

    this._resizeHandler = () => {
      this.updateValidationState();
      const passwordOutput = this.element.querySelector('#password-output');
      if (passwordOutput && passwordOutput.value) {
        this.autoResizeTextarea(passwordOutput);
      }
    };
    window.addEventListener('resize', this._resizeHandler);
  },
};
