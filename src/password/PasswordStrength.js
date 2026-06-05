/**
 * PasswordStrength Component
 * 
 * Advanced password strength analyzer with comprehensive scoring algorithm.
 * Evaluates password security based on length, character variety, entropy,
 * and pattern recognition. Provides real-time visual feedback and detailed
 * strength analysis with internationalization support.
 * 
 * @author NuwaX
 */
import { t } from '../utils/i18n.js';

/**
 * PasswordStrength Class
 * 
 * Implements sophisticated password strength analysis with multi-factor scoring:
 * - Length-based scoring with critical thresholds
 * - Character variety assessment (lowercase, uppercase, numbers, symbols)
 * - Entropy calculation with length-aware adjustments
 * - Pattern-based penalties for weak combinations
 * - Real-time UI updates with smooth animations
 */
export class PasswordStrength {
  /**
   * Initialize the PasswordStrength analyzer
   */
  constructor() {
    // Stateless analyzer - no initialization required
  }

  /**
   * Generate HTML structure for password strength meter
   * 
   * @returns {string} Complete HTML structure with progress bar and details
   */
  renderPasswordStrengthMeter() {
    return `
      <div id="password-strength-container" class="password-strength-container overflow-hidden transition-all duration-400 ease-in-out">
        <div class="space-y-2 pb-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium text-gray-700 dark:text-gray-400">${t('password.strength.title')}</span>
            <span id="strength-text" class="text-xs font-medium"></span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div id="strength-bar" class="h-full rounded-full transition-all duration-500 ease-out" style="width: 0%;"></div>
          </div>
          <div id="strength-details" class="text-xs text-gray-600 dark:text-gray-400 opacity-0 transition-opacity duration-300"></div>
        </div>
      </div>
    `;
  }

  /**
   * Comprehensive password strength analysis with multi-factor scoring
   * 
   * Scoring Algorithm:
   * - Length: 0-40 points (critical penalty for ≤3 chars)
   * - Character variety: 0-40 points (10 points per type)
   * - Entropy: 0-20 points (length-aware calculation)
   * - Pattern penalties: Additional deductions for weak patterns
   * 
   * @param {string} password - The password to analyze
   * @returns {Object} Analysis results with score, level, color, and feedback
   */
  analyzePasswordStrength(password) {
    if (!password || password.length === 0) {
      return {
        score: 0,
        level: 'empty',
        text: '',
        color: '',
        width: 0,
        details: ''
      };
    }

    let score = 0;
    const feedback = [];
    const length = password.length;

    // Critical length threshold - severe penalty for extremely short passwords
    if (length <= 3) {
      score = Math.max(0, length * 2);
      feedback.push(t('password.strength.feedback.criticallyShort'));
      
      return {
        score,
        level: 'very-weak',
        text: t('password.strength.levels.veryWeak'),
        color: 'bg-red-500',
        width: 12,
        details: `${length} ${t('password.strength.feedback.chars')} • ${feedback.join(' • ')}`
      };
    }

    // Length-based scoring with progressive thresholds
    if (length >= 16) {
      score += 40;
      feedback.push(t('password.strength.feedback.length.excellent'));
    } else if (length >= 12) {
      score += 35;
      feedback.push(t('password.strength.feedback.length.good'));
    } else if (length >= 8) {
      score += 25;
      feedback.push(t('password.strength.feedback.length.adequate'));
    } else if (length >= 6) {
      score += 15;
      feedback.push(t('password.strength.feedback.length.short'));
    } else {
      score += 8;
      feedback.push(t('password.strength.feedback.length.veryShort'));
    }

    // Character variety assessment with equal weighting
    let varietyScore = 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^a-zA-Z0-9]/.test(password);

    if (hasLower) varietyScore += 10;
    if (hasUpper) varietyScore += 10;
    if (hasNumbers) varietyScore += 10;
    if (hasSymbols) varietyScore += 10;

    score += varietyScore;

    if (varietyScore >= 40) feedback.push(t('password.strength.feedback.variety.excellent'));
    else if (varietyScore >= 30) feedback.push(t('password.strength.feedback.variety.good'));
    else if (varietyScore >= 20) feedback.push(t('password.strength.feedback.variety.moderate'));
    else feedback.push(t('password.strength.feedback.variety.limited'));

    // Entropy calculation with improved algorithm
    const uniqueChars = new Set(password).size;
    // Formula: Base entropy from unique chars + Length multiplier + Diversity factor
    const baseEntropy = Math.min(15, uniqueChars * 1.5); // Max 15 points for unique chars
    const lengthMultiplier = Math.min(1.5, length / 8); // Length factor (max 1.5x)
    const diversityFactor = uniqueChars / length; // Penalize repetition (0-1)
    const entropyBonus = Math.min(20, Math.floor(baseEntropy * lengthMultiplier * Math.max(0.4, diversityFactor))); // Cap at 20 points
    
    score += entropyBonus;

    if (entropyBonus >= 15) feedback.push(t('password.strength.feedback.entropy.high'));
    else if (entropyBonus >= 10) feedback.push(t('password.strength.feedback.entropy.good'));
    else if (entropyBonus >= 5) feedback.push(t('password.strength.feedback.entropy.low'));

    // Pattern-based penalties for weak combinations
    if (length < 8 && varietyScore <= 10) {
      score = Math.max(0, score - 10);
      feedback.push(t('password.strength.feedback.tooSimple'));
    }

    score = Math.min(100, score);

    // Strength level determination with optimized thresholds
    let level, text, color, width;
    if (score >= 75) {
      level = 'very-strong';
      text = t('password.strength.levels.veryStrong');
      color = 'bg-primary-600';
      width = 100;
    } else if (score >= 55) {
      level = 'strong';
      text = t('password.strength.levels.strong');
      color = 'bg-primary-500';
      width = 75;
    } else if (score >= 35) {
      level = 'moderate';
      text = t('password.strength.levels.moderate');
      color = 'bg-yellow-500';
      width = 50;
    } else if (score >= 18) {
      level = 'weak';
      text = t('password.strength.levels.weak');
      color = 'bg-orange-500';
      width = 25;
    } else {
      level = 'very-weak';
      text = t('password.strength.levels.veryWeak');
      color = 'bg-red-500';
      width = 12;
    }

    return {
      score,
      level,
      text,
      color,
      width,
      details: `${length} ${t('password.strength.feedback.chars')} • ${feedback.join(' • ')}`
    };
  }

  /**
   * Update password strength meter UI with smooth animations
   * 
   * @param {string} password - Current password value
   * @param {HTMLElement} containerElement - Container element with strength meter
   */
  updatePasswordStrength(password, containerElement) {
    if (!containerElement) return;

    const strengthContainer = containerElement.querySelector('#password-strength-container');
    const strengthText = containerElement.querySelector('#strength-text');
    const strengthBar = containerElement.querySelector('#strength-bar');
    const strengthDetails = containerElement.querySelector('#strength-details');

    if (!strengthContainer || !strengthText || !strengthBar || !strengthDetails) {
      return;
    }

    const analysis = this.analyzePasswordStrength(password);

    if (analysis.level === 'empty') {
      // Hide strength meter for empty password with smooth animation
      strengthContainer.classList.remove('visible');
      // Clear details opacity immediately when hiding
      strengthDetails.style.opacity = '0';
      return;
    }

    // Show strength meter with smooth animation
    strengthContainer.classList.add('visible');
    
    // Update content
    strengthText.textContent = analysis.text;
    strengthText.className = `text-xs font-medium ${this.getTextColorClass(analysis.level)}`;
    
    // Update bar with animation
    strengthBar.className = `h-full rounded-full transition-all duration-500 ease-out ${analysis.color}`;
    strengthBar.style.width = `${analysis.width}%`;
    
    // Update details with slight delay for smooth appearance
    setTimeout(() => {
      strengthDetails.textContent = analysis.details;
      strengthDetails.style.opacity = '1';
    }, 100); // Small delay to ensure container is visible first
  }

  /**
   * Get appropriate text color class based on strength level
   * 
   * @param {string} level - Strength level identifier
   * @returns {string} Tailwind CSS color classes for text
   */
  getTextColorClass(level) {
    switch (level) {
      case 'very-strong':
        return 'text-primary-600 dark:text-primary-400';
      case 'strong':
        return 'text-primary-500 dark:text-primary-400';
      case 'moderate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'weak':
        return 'text-orange-600 dark:text-orange-400';
      case 'very-weak':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }
} 