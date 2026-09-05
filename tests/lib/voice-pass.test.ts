import { describe, expect, it } from 'vitest';
import {
  KAUSTUBH_VOICE_SYSTEM,
  validateVoicePass,
} from '@/lib/ai/voice-pass';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #8 — screener voice pass. The rewrite is STYLE-ONLY:
   the validator is the last line of defense against model drift
   (invented content, forbidden lexicon, inflated length).
   ══════════════════════════════════════════════════════════════ */

const FLOOR =
  'The subject exhibits a self-worth algorithm calibrated to external validation through caretaking. ' +
  'Practice: Nāḍī Śuddhi, alternate nostril breathing, 15 minutes daily.';

describe('validateVoicePass', () => {
  it('accepts a faithful, human-voiced rewrite', () => {
    const rewrite =
      'You find yourself measuring your worth by how much you carry for others. ' +
      'Begin with Nāḍī Śuddhi — alternate nostril breathing, fifteen minutes a day.';
    expect(validateVoicePass(FLOOR, rewrite)).toBe(rewrite.trim());
  });

  it('rejects rewrites that inflate the floor (invention guard)', () => {
    const padded = FLOOR + ' ' + 'Also you should journal every morning and evening and attend satsang weekly. '.repeat(4);
    expect(validateVoicePass(FLOOR, padded)).toBeNull();
  });

  it('rejects forbidden lexicon even when the meaning is faithful', () => {
    const rewrite =
      'You are on a healing journey — the vibes will shift as you release the trauma. ' +
      'Practice breathwork daily.';
    expect(validateVoicePass(FLOOR, rewrite)).toBeNull();
  });

  it('word-boundary anchoring: innocent words containing forbidden stems pass', () => {
    const rewrite =
      'You keep rescuing people who never ask to be saved. ' +
      'The crystalline structure of the habit repeats until you interrupt it with daily breath practice.';
    expect(validateVoicePass(FLOOR, rewrite)).not.toBeNull();
  });

  it('rejects markdown, links, and meta-instruction leaks', () => {
    expect(validateVoicePass(FLOOR, 'Sure! Here is your rewrite:\nhttps://example.com')).toBeNull();
    expect(validateVoicePass(FLOOR, '```json\n{"x":1}\n```')).toBeNull();
    expect(validateVoicePass(FLOOR, '**Bold opening.** You keep rescuing. Daily breath.')).toBeNull();
  });

  it('rejects empty or trivial output', () => {
    expect(validateVoicePass(FLOOR, '   ')).toBeNull();
    expect(validateVoicePass(FLOOR, 'ok')).toBeNull();
  });

  it('rejects when the floor itself is too short to restyle', () => {
    expect(validateVoicePass('Short floor.', 'A slightly longer rewrite of nothing.')).not.toBeNull();
  });
});

describe('KAUSTUBH_VOICE_SYSTEM prompt contract', () => {
  it('mandates rewrite-only, second person, no promises', () => {
    expect(KAUSTUBH_VOICE_SYSTEM).toMatch(/REWRITE, never invent/);
    expect(KAUSTUBH_VOICE_SYSTEM).toMatch(/Second person/);
    expect(KAUSTUBH_VOICE_SYSTEM).toMatch(/NO promises/);
  });

  it('carries the forbidden lexicon into the prompt', () => {
    expect(KAUSTUBH_VOICE_SYSTEM).toContain('manifest');
    expect(KAUSTUBH_VOICE_SYSTEM).toContain('journey');
  });
});
