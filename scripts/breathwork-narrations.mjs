// =============================================================
// KALKI — BREATHWORK + DOOR NARRATION SCRIPTS (Vol. 4 #12 pilot)
// -------------------------------------------------------------
// The BAKE-TIME text behind the guided narrations. Plain data, no
// SDK imports — the bake script (bake-breathwork-audio.mjs) feeds
// these to TTS, and the vitest suite imports this file to pin the
// contract (scripts exist, each fits ONE TTS request ≤1024 chars,
// the audio files are committed for every script).
//
// PILOT SCOPE (roadmap #12): the four foundational breath patterns
// (the classical progression a seeker meets first — basic alternate
// nostril, its retention build, Bhrāmarī, Ujjāyī) + Door 1 as the
// sample Doors narration. Scale-to-all-10-Doors is post-pilot.
//
// VOICE: the cue numbers are the REAL pattern math from
// breath-patterns.ts (phases × cycles) — a narration never teaches a
// timing the visualizer does not show. Door 1's script is the door's
// own copy (course-content.ts), lightly abridged for the ear.
// =============================================================

export const TTS_VOICE = 'jam';
export const TTS_SPEED = '0.95';
export const TTS_CHAR_LIMIT = 1024; // hard API limit; scripts must stay under ONE request

/**
 * @type {Array<{slug: string, title: string, outFile: string, script: string}>}
 */
export const breathNarrationScripts = [
  {
    slug: 'nadi-shuddhi-basic',
    title: 'Nāḍī Śuddhi — Basic (guided)',
    outFile: 'public/audio/breathwork/nadi-shuddhi-basic.mp3',
    script:
      'Nadi Shuddhi — alternate nostril breathing, the foundational purification. Sit tall. Left hand rests on the knee. Right hand shapes the nose: thumb over the right nostril, ring finger over the left. We begin. Close the right nostril. Inhale through the left — four counts. Close. Exhale through the right — four counts. Inhale through the right — four. Close. Exhale through the left — four. That is one round: sixteen counts, balanced on both sides. Nine rounds. Let each exhale be slightly longer than it wants to be — that is where the nervous system learns to set the bag down. Balance is the goal, not force. When the rounds are done, sit for a moment. Notice the space between the breaths. That space is the practice.',
  },
  {
    slug: 'nadi-shuddhi-with-retention',
    title: 'Nāḍī Śuddhi — With Retention (guided)',
    outFile: 'public/audio/breathwork/nadi-shuddhi-with-retention.mp3',
    script:
      'Nadi Shuddhi with retention — the one to one to two ratio. Sit tall. Right hand at the nose: thumb over the right nostril, ring finger over the left. The pattern: inhale left, four. Retain, four. Exhale right, eight. Then inhale right, four. Retain, four. Exhale left, eight. Begin. In through the left — two, three, four. Hold — two, three, four. Out through the right — two, three, four, five, six, seven, eight. The exhale is twice the inhale. Never force the retention — capacity is built over weeks, not in a session. Seven rounds. If the hold ever feels like strain, drop back to the basic pattern for a few days. When the rounds are done, breathe freely. Notice the quiet. That steadiness is the point.',
  },
  {
    slug: 'bhramari',
    title: 'Bhramarī — Bee Breath (guided)',
    outFile: 'public/audio/breathwork/bhramari.mp3',
    script:
      'Bhramari — the bee breath. Sit comfortably. Lips closed, jaw loose, teeth apart. Eyes closed or soft gaze downward. The exhale becomes a hum — a bee\u2019s note, low and steady, felt in the face and the chest. Begin. Inhale through the nose — four counts. And hum on the exhale — eight counts, even, unhurried, until the breath is fully out. Again. Inhale four. Hum eight. The vibration stimulates the vagus nerve — this is parasympathetic activation you can hear. Eleven rounds. Let the hum find its own pitch; do not perform it. If thoughts are loud, let the sound carry them out. When the rounds are done, sit in the silence that follows. That silence is not empty. It is what the hum was clearing space for.',
  },
  {
    slug: 'ujjayi-pranayama',
    title: 'Ujjāyī — Ocean Breath (guided)',
    outFile: 'public/audio/breathwork/ujjayi-pranayama.mp3',
    script:
      'Ujjayi — the ocean breath. The throat gently narrows at the glottis, and the breath acquires a sound like waves heard from inside the shore. Sit tall, or use this during asana practice. Begin. Inhale through the nose with a soft constriction in the throat — four counts, ocean sound rising. Exhale the same way — six counts, ocean sound falling. The constriction is gentle — as if fogging a mirror, but with the mouth closed. Fifteen rounds. The sound gives the mind a single point to rest on. If the throat feels scratchy, ease off — the sound should never be forced. When the rounds are done, let the breath return to normal. Notice the warmth, the focus, the inner shoreline. This is the breath of choice in many lineages for one reason: it works.',
  },
];

export const doorNarrationScripts = [
  {
    slug: 'door-01',
    title: 'Door 1 — Kālimā: the ending you keep reopening (narrated)',
    outFile: 'public/audio/doors/door-01.mp3',
    script:
      'Door 1. Kalima. The ending you keep reopening. Kalima wears the ending as a garland. Not to celebrate death — to make it visible. In your life, the ending already happened. What continues is the reopening. The profile you still check. The job you still mourn. The friendship you keep resuscitating with one more message. Every check is a resurrection attempt — and each one costs the same fee: the present tense. The Tantric read: Kali does not end things. She ends the illusion that endings are optional. What refuses to close refuses to open what comes next. Tonight\u2019s one line: what ending are you still reopening? This was Door 1 of the 10 Doors. The full letter is in your inbox.',
  },
];

/** All narration rows in one list (the bake script iterates this). */
export const allNarrationScripts = [...breathNarrationScripts, ...doorNarrationScripts];
