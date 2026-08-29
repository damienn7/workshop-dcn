import { describe, expect, it } from 'vitest';

import { getBuybackBaseValue, mapValueToScore } from './scoring.engine';

describe('getBuybackBaseValue', () => {
  it.each([
    { score: 90, expected: 70 },
    { score: 85, expected: 70 },
    { score: 84, expected: 65 },
    { score: 75, expected: 65 },
    { score: 74, expected: 60 },
    { score: 60, expected: 60 },
    { score: 59, expected: 55 },
    { score: 50, expected: 55 },
    { score: 49, expected: 0 }
  ])('applies the current coefficient boundary for score $score', ({ score, expected }) => {
    expect(getBuybackBaseValue(100, score)).toBe(expected);
  });

  it('rounds the computed base value to the nearest euro', () => {
    expect(getBuybackBaseValue(99, 75)).toBe(64);
  });
});

describe('mapValueToScore', () => {
  it.each([
    ['excellent', 100],
    ['good', 75],
    ['medium', 50],
    ['bad', 25],
    ['out_of_service', 0],
    ['no_shock', 100],
    ['shock', 0],
    ['no_issue', 100],
    ['small_difficulty', 60],
    ['normal_wear', 75],
    ['functional', 90],
    ['replace', 25],
    ['correct', 80],
    ['dry', 60],
    ['good_wear', 75],
    ['clean', 85],
    ['cleaning_needed', 50],
    ['dangerous', 0]
  ])('maps exact token %s to %i', (token, expected) => {
    expect(mapValueToScore(token)).toBe(expected);
  });

  it.each([
    ['very good condition', 75],
    ['excellent shape', 100],
    ['medium wear', 50],
    ['bad alignment', 25],
    ['out of order', 0],
    ['no visible issue', 100],
    ['unmapped label', 50]
  ])('maps unknown string %s with the current fallback heuristic', (value, expected) => {
    expect(mapValueToScore(value)).toBe(expected);
  });

  it('returns numbers unchanged', () => {
    expect(mapValueToScore(42)).toBe(42);
  });

  it.each([undefined, null, '', 0])('returns the current empty-value score for %s', (value) => {
    expect(mapValueToScore(value as string | number | undefined)).toBe(0);
  });
});
