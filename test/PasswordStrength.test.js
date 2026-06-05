import { describe, it, expect, beforeAll, vi } from 'vitest';

// t() returns the key so tests stay language-agnostic
vi.mock('../src/utils/i18n.js', () => ({
  t: (key) => key,
  default: {},
}));

import { PasswordStrength } from '../src/password/PasswordStrength.js';

describe('PasswordStrength', () => {
  let ps;

  beforeAll(() => {
    ps = new PasswordStrength();
  });

  // ─── analyzePasswordStrength ───────────────────────────────────────────────

  describe('analyzePasswordStrength', () => {
    it('returns empty result for empty string', () => {
      const r = ps.analyzePasswordStrength('');
      expect(r.level).toBe('empty');
      expect(r.score).toBe(0);
      expect(r.width).toBe(0);
      expect(r.text).toBe('');
    });

    it('returns empty result for null', () => {
      const r = ps.analyzePasswordStrength(null);
      expect(r.level).toBe('empty');
    });

    it('returns very-weak for single character', () => {
      expect(ps.analyzePasswordStrength('a').level).toBe('very-weak');
    });

    it('returns very-weak for passwords with 3 or fewer characters', () => {
      expect(ps.analyzePasswordStrength('ab').level).toBe('very-weak');
      expect(ps.analyzePasswordStrength('abc').level).toBe('very-weak');
    });

    it('score increases with password length', () => {
      const short = ps.analyzePasswordStrength('Aa1!ab');
      const long  = ps.analyzePasswordStrength('Aa1!abcdefghij');
      expect(long.score).toBeGreaterThan(short.score);
    });

    it('score increases with character variety', () => {
      const lowerOnly = ps.analyzePasswordStrength('abcdefghij');
      const mixed     = ps.analyzePasswordStrength('Abcdefg1!x');
      expect(mixed.score).toBeGreaterThan(lowerOnly.score);
    });

    it('long password with all character types reaches very-strong', () => {
      // 21 chars, uppercase + lowercase + numbers + symbols
      const r = ps.analyzePasswordStrength('Abc123!@#XYZ456$%^qwe');
      expect(r.level).toBe('very-strong');
      expect(r.width).toBe(100);
    });

    it('score is capped at 100', () => {
      const r = ps.analyzePasswordStrength('Aa1!'.repeat(20));
      expect(r.score).toBeLessThanOrEqual(100);
    });

    it('details string contains the character count', () => {
      const pwd = 'TestPwd123!';
      const r   = ps.analyzePasswordStrength(pwd);
      expect(r.details).toContain(String(pwd.length));
    });

    it('all returned levels are recognised values', () => {
      const validLevels = new Set(['empty', 'very-weak', 'weak', 'moderate', 'strong', 'very-strong']);
      const passwords = ['', 'a', 'abc', 'abcde', 'Abcde1!', 'Abcde1!XYZ', 'Abc123!@#XYZ456$%^qwe'];
      for (const pwd of passwords) {
        const r = ps.analyzePasswordStrength(pwd);
        expect(validLevels.has(r.level), `Unexpected level "${r.level}" for "${pwd}"`).toBe(true);
      }
    });
  });

  // ─── getTextColorClass ─────────────────────────────────────────────────────

  describe('getTextColorClass', () => {
    it('returns a primary colour class for very-strong', () => {
      expect(ps.getTextColorClass('very-strong')).toContain('primary');
    });

    it('returns a primary colour class for strong', () => {
      expect(ps.getTextColorClass('strong')).toContain('primary');
    });

    it('returns a yellow colour class for moderate', () => {
      expect(ps.getTextColorClass('moderate')).toContain('yellow');
    });

    it('returns an orange colour class for weak', () => {
      expect(ps.getTextColorClass('weak')).toContain('orange');
    });

    it('returns a red colour class for very-weak', () => {
      expect(ps.getTextColorClass('very-weak')).toContain('red');
    });

    it('returns a grey fallback for an unknown level', () => {
      expect(ps.getTextColorClass('unknown')).toContain('gray');
    });

    it('returns a non-empty string for every valid level', () => {
      const levels = ['very-strong', 'strong', 'moderate', 'weak', 'very-weak'];
      for (const level of levels) {
        expect(ps.getTextColorClass(level).length).toBeGreaterThan(0);
      }
    });
  });
});
