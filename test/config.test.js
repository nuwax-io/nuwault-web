import { describe, it, expect } from 'vitest';
import {
  buildSymbolsCharset,
  buildCharacterSets,
  CHARACTER_SETS,
  SYMBOL_GROUPS,
  LOOK_ALIKE_CHARS,
} from '../src/utils/config.js';

const defaultCategories = {
  logograms: true,
  math: true,
  braces: true,
  dashes: true,
  punctuation: true,
  quotes: false,
  extended: false,
};

const allOffCategories = {
  logograms: false,
  math: false,
  braces: false,
  dashes: false,
  punctuation: false,
  quotes: false,
  extended: false,
};

// ─── buildSymbolsCharset ─────────────────────────────────────────────────────

describe('buildSymbolsCharset', () => {
  it('returns the original SYMBOLS string for the default category selection', () => {
    expect(buildSymbolsCharset(defaultCategories)).toBe(CHARACTER_SETS.SYMBOLS);
  });

  it('does NOT return the original SYMBOLS string when excludeLookAlike is true', () => {
    expect(buildSymbolsCharset(defaultCategories, true)).not.toBe(CHARACTER_SETS.SYMBOLS);
  });

  it('returns empty string when all categories are disabled', () => {
    expect(buildSymbolsCharset(allOffCategories)).toBe('');
  });

  it('includes only logograms when only that category is enabled', () => {
    const cats = { ...allOffCategories, logograms: true };
    expect(buildSymbolsCharset(cats)).toBe(SYMBOL_GROUPS.LOGOGRAMS);
  });

  it('includes quotes characters when the quotes category is enabled', () => {
    const cats = { ...defaultCategories, quotes: true };
    const result = buildSymbolsCharset(cats);
    expect(result).toContain('"');
    expect(result).toContain("'");
  });

  it('builds charset from groups (not shortcut) when excludeLookAlike is true', () => {
    // excludeLookAlike=true only breaks the isOriginalDefault shortcut;
    // the actual character filtering is done in buildCharacterSets.
    const result = buildSymbolsCharset(defaultCategories, true);
    const expected = SYMBOL_GROUPS.LOGOGRAMS + SYMBOL_GROUPS.MATH + SYMBOL_GROUPS.BRACES +
                     SYMBOL_GROUPS.DASHES + SYMBOL_GROUPS.PUNCTUATION;
    expect(result).toBe(expected);
  });

  it('concatenates enabled categories in order', () => {
    const cats = { ...allOffCategories, math: true, punctuation: true };
    const result = buildSymbolsCharset(cats);
    expect(result).toBe(SYMBOL_GROUPS.MATH + SYMBOL_GROUPS.PUNCTUATION);
  });
});

// ─── buildCharacterSets ──────────────────────────────────────────────────────

describe('buildCharacterSets', () => {
  it('returns an object with UPPERCASE, LOWERCASE, NUMBERS, SYMBOLS keys', () => {
    const result = buildCharacterSets(defaultCategories);
    expect(result).toHaveProperty('UPPERCASE');
    expect(result).toHaveProperty('LOWERCASE');
    expect(result).toHaveProperty('NUMBERS');
    expect(result).toHaveProperty('SYMBOLS');
  });

  it('UPPERCASE contains A and Z', () => {
    const { UPPERCASE } = buildCharacterSets(defaultCategories);
    expect(UPPERCASE).toContain('A');
    expect(UPPERCASE).toContain('Z');
  });

  it('LOWERCASE contains a and z', () => {
    const { LOWERCASE } = buildCharacterSets(defaultCategories);
    expect(LOWERCASE).toContain('a');
    expect(LOWERCASE).toContain('z');
  });

  it('NUMBERS contains digits 0-9', () => {
    const { NUMBERS } = buildCharacterSets(defaultCategories);
    for (let d = 0; d <= 9; d++) {
      expect(NUMBERS).toContain(String(d));
    }
  });

  it('does not remove any chars when excludeLookAlike is false', () => {
    const result = buildCharacterSets(defaultCategories, false);
    expect(result.NUMBERS).toContain('0');
    expect(result.NUMBERS).toContain('1');
    expect(result.UPPERCASE).toContain('I');
    expect(result.UPPERCASE).toContain('O');
    expect(result.LOWERCASE).toContain('l');
  });

  it('removes look-alike chars from ALL sets when excludeLookAlike is true', () => {
    const result = buildCharacterSets(defaultCategories, true);
    const lookAlikeSet = new Set(LOOK_ALIKE_CHARS.split(''));

    for (const set of ['UPPERCASE', 'LOWERCASE', 'NUMBERS', 'SYMBOLS']) {
      for (const ch of result[set]) {
        expect(lookAlikeSet.has(ch), `"${ch}" should have been removed from ${set}`).toBe(false);
      }
    }
  });

  it('all sets remain non-empty after look-alike exclusion', () => {
    const result = buildCharacterSets(defaultCategories, true);
    expect(result.UPPERCASE.length).toBeGreaterThan(0);
    expect(result.LOWERCASE.length).toBeGreaterThan(0);
    expect(result.NUMBERS.length).toBeGreaterThan(0);
  });

  it('SYMBOLS is empty when all symbol categories are off', () => {
    const { SYMBOLS } = buildCharacterSets(allOffCategories);
    expect(SYMBOLS).toBe('');
  });
});
