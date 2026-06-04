import { CHARACTER_SETS, buildCharacterSets } from '../utils/config.js';

export const GeneratorAnimation = {
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
  },

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

    const animSets = buildCharacterSets(this.symbolCategories, this.excludeLookAlike);
    const symbolsEnabled = Object.values(this.symbolCategories).some(Boolean);
    let availableChars = '';
    if (this.options.includeUppercase) availableChars += animSets.UPPERCASE;
    if (this.options.includeLowercase) availableChars += animSets.LOWERCASE;
    if (this.options.includeNumbers)   availableChars += animSets.NUMBERS;
    if (symbolsEnabled)                availableChars += animSets.SYMBOLS;

    if (!availableChars) {
      availableChars = animSets.LOWERCASE || CHARACTER_SETS.LOWERCASE;
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
  },

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
  },
};
