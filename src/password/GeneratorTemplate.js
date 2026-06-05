import { SECURITY_CONFIG, KEYWORD_MANAGEMENT_OPTIONS } from '../utils/config.js';
import { t } from '../utils/i18n.js';

export const GeneratorTemplate = {
  /**
   * Escape a string for safe insertion into HTML text content.
   */
  _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  /**
   * Build symbol-category checkbox HTML without nested template literals.
   * Keeps the chars display safe from HTML injection.
   */
  _renderSymbolCheckboxes() {
    const rows = [
      ['sym-logograms',   'logograms',   t('password.generator.symbolTypes.logograms'),   '#$%&@^`~'],
      ['sym-math',        'math',        t('password.generator.symbolTypes.math'),        '<>*+!?='],
      ['sym-braces',      'braces',      t('password.generator.symbolTypes.braces'),      '{[()]}'],
      ['sym-dashes',      'dashes',      t('password.generator.symbolTypes.dashes'),      '\\/|_-'],
      ['sym-punctuation', 'punctuation', t('password.generator.symbolTypes.punctuation'), '.,:;'],
      ['sym-quotes',      'quotes',      t('password.generator.symbolTypes.quotes'),      '"\''],
      ['sym-extended',    'extended',    t('password.generator.symbolTypes.extended'),    '½©²±é'],
    ];
    const checkboxClass = 'w-4 h-4 mt-0.5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0';
    let html = '';
    for (const [id, key, label, chars] of rows) {
      const checked = this.symbolCategories[key] ? 'checked' : '';
      html += '<label class="flex items-start space-x-2 cursor-pointer">'
            + '<input type="checkbox" id="' + id + '" ' + checked + ' class="' + checkboxClass + '">'
            + '<span class="text-sm text-gray-800 dark:text-gray-300">'
            + this._esc(label)
            + '<code class="ml-1 text-xs text-gray-500 dark:text-gray-400 font-mono">' + this._esc(chars) + '</code>'
            + '</span></label>';
    }
    return html;
  },

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
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-800 dark:text-gray-300">
            ${t('password.generator.symbolTypes.title')}
          </label>
          <div class="grid grid-cols-2 gap-3">
            ${this._renderSymbolCheckboxes()}
          </div>
          <label class="flex items-center space-x-2 cursor-pointer mt-2">
            <input type="checkbox" id="exclude-look-alike" ${this.excludeLookAlike ? 'checked' : ''}
                   class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
            <span class="text-sm text-gray-700 dark:text-gray-300">
              ${t('password.generator.symbolTypes.excludeLookAlike')}
              <code class="ml-1 text-xs text-gray-500 dark:text-gray-400 font-mono">0 1 l I O | . B 9 G 6</code>
            </span>
          </label>
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
  },
};
