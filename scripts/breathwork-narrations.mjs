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
  // ── Vol. 5 #9 — the long tail. Cue numbers below are the REAL pattern
  // math from breath-patterns.ts (phases × cycles); the narration never
  // teaches a timing the visualizer does not show. Order: entry patterns
  // first, then the build, then the advanced pair (caution order — all
  // breathwork folios are OPEN; the order is the classical progression).
  {
    slug: 'sitali',
    title: 'Śītalī — Cooling Breath (guided)',
    outFile: 'public/audio/breathwork/sitali.mp3',
    script:
      'Shitali — the cooling breath. Sit tall. If you can, curl the tongue into a tube; if the tongue will not curl, press it flat against the roof of the mouth — the tradition accepts both. Begin. Inhale through the rolled tongue — four counts, air cooling across the tongue like a stream. Retain — two. Exhale through the nostrils — six, warm, even. Again. In through the tongue — four. Hold — two. Out through the nose — six. Nine rounds. The tongue-passage cools the blood and quiets the nervous system; this is the breath for heat — the heat of anger, of overwork, of long days. After the rounds, breathe normally and notice the temperature drop behind the palate. Coolness is the practice.',
  },
  {
    slug: 'kapalabhati-basic',
    title: 'Kapālabhāti — Skull Shining, basic (guided)',
    outFile: 'public/audio/breathwork/kapalabhati-basic.mp3',
    script:
      'Kapalabhati — skull-shining breath, the basic round. Sit tall, hands on the knees. This is the one pranayama where the exhale is active and the inhale happens by itself. Begin. Sharp exhale through the nose — the belly snaps toward the spine. Release — the inhale falls in passively, half a beat. Snap — release. Snap — release. Thirty pumps, brisk and even, like a bellows in quick strokes. Do not chase speed; chase rhythm. On the last pump, exhale fully and let the breath rest — notice the stillness after. Then breathe normally for a few rounds. Two more rounds if you have the capacity, with rest between. Kapalabhati clears the sinuses, wakes the frontal brain, and burns the fog. Light, not strain — if you feel dizzy, stop and breathe normally.',
  },
  {
    slug: 'surya-bhedana',
    title: 'Sūrya Bhedana — Solar Piercing (guided)',
    outFile: 'public/audio/breathwork/surya-bhedana.mp3',
    script:
      'Surya Bhedana — solar-piercing breath, for lethargy and heaviness. Sit tall. Right hand at the nose: thumb over the right nostril, ring finger over the left. Close the left. Inhale through the right — four counts, the solar channel warming. Close both. Retain — four. Close the right, open the left. Exhale through the left — eight, slow. That is one round. Again: in through the right — four. Hold — four. Out through the left — eight. Nine rounds. The right nostril carries the pingala — the solar current, heat, alertness. This breath stokes it deliberately, the way you open a curtain in the morning. Never do it when feverish or overheated. After the rounds, sit and notice the waking warmth behind the brow. That is the sun lit indoors.',
  },
  {
    slug: 'chandra-bhedana',
    title: 'Candra Bhedana — Lunar Piercing (guided)',
    outFile: 'public/audio/breathwork/chandra-bhedana.mp3',
    script:
      'Chandra Bhedana — lunar-piercing breath, for restlessness and heat of mind. Sit tall. Right hand at the nose: thumb over the right nostril, ring finger over the left. Close the right. Inhale through the left — four counts, the lunar channel cooling. Close both. Retain — four. Close the left, open the right. Exhale through the right — eight, slow. That is one round. Again: in through the left — four. Hold — four. Out through the right — eight. Nine rounds. The left nostril carries the ida — the lunar current, coolness, receptivity. Where Surya Bhedana lights the fire, this one shades it. Use it when anxiety dominates, when the mind races at night. After the rounds, breathe freely and notice the settling. The moon cools what the sun lit.',
  },
  {
    slug: 'bhastrika',
    title: 'Bhastrikā — Bellows Breath (guided)',
    outFile: 'public/audio/breathwork/bhastrika.mp3',
    script:
      'Bhastrika — the bellows breath. Strong, symmetrical, both nostrils. Sit tall. Unlike Kapalabhati, both phases here are active and full. Begin. Forceful inhale through the nose — one count, chest and belly filling. Forceful exhale — one count, everything out. In — one. Out — one. Ten strokes, equal and strong, like a bellows feeding a forge. Then exhale fully and rest, breathing normally, before the next round. Three rounds is a complete session. Bhastrika builds real heat — it wakes the system the way sunlight wakes a room. It is the most vigorous pranayama in the entry corpus, so: no forcing, no heroics, and never during fever, pregnancy or cardiac conditions. After the rounds, sit in the warmth. The forge glows; the smith rests.',
  },
  {
    slug: 'nadi-shuddhi-advanced',
    title: 'Nāḍī Śuddhi — Advanced ratio (guided)',
    outFile: 'public/audio/breathwork/nadi-shuddhi-advanced.mp3',
    script:
      'Nadi Shuddhi — the advanced ratio, one to one to two at six counts. Only after the four-eight version feels easy for weeks. Sit tall. Right hand at the nose. Begin. Inhale through the left — six. Retain — six. Exhale through the right — twelve, twice the inhale, unhurried. Inhale through the right — six. Retain — six. Exhale through the left — twelve. That is one round. Five rounds. The counts are longer, so the discipline is different: the twelve-count exhale must stay a tide, not a squeeze. If the retention strains, return to the shorter ratio — capacity is grown, never seized. This is the pattern that prepares the system for kevala kumbhaka, the spontaneous retention. After the rounds, sit. Notice how long the pause after the exhale has become on its own.',
  },
  {
    slug: 'kapalabhati-advanced',
    title: 'Kapālabhāti — Advanced (guided)',
    outFile: 'public/audio/breathwork/kapalabhati-advanced.mp3',
    script:
      'Kapalabhati — the advanced round. Fifty pump cycles at double the tempo of the basic variation. Prerequisite: the basic thirty-cycle round steadied for at least four weeks. If that is not your practice yet, return to the basic — this one waits. Sit tall. Begin. Snap the exhale — half a beat. Passive inhale — half a beat. Faster now: snap, release, snap, release — fifty pumps, brisk, metronomic, the belly a piston. On the last pump, empty fully and hold the emptiness a moment before breathing in. Rest. Breathe normally between rounds; rest is essential — the heat needs time to settle. Two rounds at most. The advanced round builds sustained internal heat and clears the frontal passage deeply. Heat without steadiness is just agitation — earn this one.',
  },
  {
    slug: 'kevala-kumbhaka',
    title: 'Kevala Kumbhaka — Spontaneous Retention (guided)',
    outFile: 'public/audio/breathwork/kevala-kumbhaka.mp3',
    script:
      'Kevala Kumbhaka — spontaneous retention. This is not a technique to perform; it is a state that arrives. What follows is its container. Sit tall. Breathe freely until the breath is quiet and small. Then: inhale gently — four counts. And simply stay. The retention is sustained — up to thirty counts — but never held the way a fist holds. Hold the way a pause holds between two sentences. Exhale — eight, slow, without pushing. Three cycles at most. If the retention shakes or burns, the practice is not ready for you; return to nadi shuddhi and let the capacity grow. Kevala kumbhaka is the advanced sign that the pranic system has recalibrated — the breath suspends itself. Do not chase it. Keep the practice honest and it arrives unannounced. After the cycles, sit in the silence. That is what it was for.',
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
  // ── Vol. 5 #9 — the Doors, told aloud in full. Each script is the
  // door's own copy (course-content.ts), lightly abridged for the ear,
  // in the Door 1 shape. The email listen line attaches automatically
  // via audio-narrations.ts once the file is committed.
  {
    slug: 'door-02',
    title: 'Door 2 — Tārā: why chaos feels like home (narrated)',
    outFile: 'public/audio/doors/door-02.mp3',
    script:
      'Door 2. Tara. Why chaos feels like home. Notice how calm makes you itchy. The deadline you manufacture, the drama you walk toward, the crisis you refuse to prevent — urgency is a room you grew up in, so you keep renting it. Tara is the navigator: the one who crosses chaos without drinking it. She crosses rivers — she does not move into them. The tradition keeps her image green: the colour of a crossing still possible. The loop: you manufacture urgency because calm feels unfamiliar, and unfamiliar reads as danger. Chaos is not your temperament. It is your address. Tonight\u2019s one line: name the last time you were bored and peaceful for a full hour. If you cannot — that is the file. This was Door 2 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-03',
    title: 'Door 3 — Tripura Sundarī: the desire that never fills (narrated)',
    outFile: 'public/audio/doors/door-03.mp3',
    script:
      'Door 3. Tripura Sundari. The desire that never fills. The buy, the scroll, the next plan, the one-more-thing. The missing thing always feels one purchase away — and arrives, and the shelf behind it is already empty again. Tripura Sundari is not the desire. She is what remains when desire stops running — the beauty that was under the wanting the whole time. The tradition places her at the centre of three cities: waking, dreaming, sleeping — the same hunger runs all three. The loop: consumption as a cure. But consumption treats the symptom of an unfelt life — it cannot cause one. Tonight\u2019s one line: the last thing you acquired — write the feeling you hoped it would produce. Then write what it actually produced. The gap is the Door. This was Door 3 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-04',
    title: 'Door 4 — Bhuvaneśvarī: control is a room with no windows (narrated)',
    outFile: 'public/audio/doors/door-04.mp3',
    script:
      'Door 4. Bhuvaneshvari. Control is a room with no windows. The schedule managed to the minute. The person managed to the sentence. The outcome managed to the fantasy. Control feels like safety — look closer: it is a room with no windows. Nothing gets in. Including what you actually wanted. Bhuvaneshvari is space itself — the goddess of the room, not the furniture. Where you grip, she is exactly what the grip prevents: room for things to arrange themselves. The loop: you control people, outcomes and schedules because space feels like danger. But space is where every good thing in your life entered — uninvited. Tonight\u2019s one line: one thing you will deliberately not control tomorrow. Then watch what actually happens. Write it down exactly. This was Door 4 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-05',
    title: 'Door 5 — Bhairavī: the anger you swallow (narrated)',
    outFile: 'public/audio/doors/door-05.mp3',
    script:
      'Door 5. Bhairavi. The anger you swallow comes back wearing your face. You have never lost your temper — that is the problem. The sarcasm that wins the room. The mood everyone walks around. The jaw at two in the morning. The body symptom with no diagnosis. Suppressed fire does not disappear; it changes address. Bhairavi is the fire that digests, not destroys. She is what your unspoken sentence looks like when it stops asking permission. The tradition does not vilify her — it feeds her, because undigested experience is the actual poison. The loop: swallowed anger refluxes as sarcasm, symptoms, moods. It never left. It moved in. Tonight\u2019s one line: if the anger has an address in your body, write the address. This was Door 5 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-06',
    title: 'Door 6 — Chhinnamastā: you give until you disappear (narrated)',
    outFile: 'public/audio/doors/door-06.mp3',
    script:
      'Door 6. Chhinnamasta. You give until you disappear. The friend who funds everyone\u2019s plans with her own exhaustion. The parent who has no biography left. The colleague whose calendar is a public utility. You are generous — and you have also cut off the giver. Chhinnamasta gives her own head. The image shocks because it should: she severs the part that keeps saying yes past the point of blood. Not to end generosity — to end generosity that costs the self entirely. The loop: over-giving as identity. Everyone\u2019s life is funded by yours; your own needs are unlisted. Tonight\u2019s one line: the last time someone saw YOUR need. Write the date. If it is blank — that is the finding. This was Door 6 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-07',
    title: 'Door 7 — Dhūmāvatī: the emptiness you keep busy to avoid (narrated)',
    outFile: 'public/audio/doors/door-07.mp3',
    script:
      'Door 7. Dhumavati. The emptiness you keep busy to avoid. The calendar as a hiding place. Every silence filled with a podcast, every pause with a scroll, every unscheduled hour scheduled — busyness as anesthesia, and the numbness spreading. Dhumavati is the goddess of the empty room — the most misunderstood of the ten. She does not bring the emptiness. She sits in it, unhurried, until you can too. What you find in minute seven is what the busyness was built to hide. The loop: busyness as avoidance. The emptiness is not the danger; the anesthesia is. Tonight\u2019s one line: sit in an empty room, no screen, ten minutes. Write what arrives in minute seven. This was Door 7 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-08',
    title: 'Door 8 — Bagalāmukhī: starting and stopping is one pattern (narrated)',
    outFile: 'public/audio/doors/door-08.mp3',
    script:
      'Door 8. Bagalamukhi. Starting and stopping is one pattern, not two. The project at seventy percent. The gym at week three. The language at lesson nine. You have called it procrastination, then discipline problems, then burnout — three names, one mechanism. Bagalamukhi is the power of the still point. She freezes what should be frozen — the enemy\u2019s tongue, the runaway mind. Your problem is not the freeze. It is that she is operating on the wrong targets: frozen mid-launch, thawed mid-crisis. The loop: the freeze. Starting and stopping are one pattern wearing two masks — the still point applied backwards. Tonight\u2019s one line: list three things frozen at seventy percent. One of them deserves the freeze. The other two are waiting. This was Door 8 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-09',
    title: 'Door 9 — Mātaṅgī: you\u2019ve been rehearsing silence (narrated)',
    outFile: 'public/audio/doors/door-09.mp3',
    script:
      'Door 9. Matangi. You have been rehearsing silence. The opinion edited out of the meeting. The boundary softened into a hint. The sentence rewritten until it asked for nothing. You call it diplomacy — the tradition calls it rehearsal. Matangi is the outcaste goddess: she speaks from outside the court, and her speech remakes the court. The tradition places her at the margins on purpose — that is where the unsaid sentence lives, and it is louder than everything said politely inside. The loop: the swallowed voice. Every edit teaches the throat a smaller vocabulary. Tonight\u2019s one line: the sentence you edited out this week. Say it today — exactly as it was first written. This was Door 9 of the 10 Doors. The full letter is in your inbox.',
  },
  {
    slug: 'door-10',
    title: 'Door 10 — Kamalā: the worthiness invoice (narrated)',
    outFile: 'public/audio/doors/door-10.mp3',
    script:
      'Door 10. Kamala. The worthiness invoice. Collect it. Ten days ago you started collecting data. Look at your notes: every line that begins this-is-where-it-happens is an invoice for worthiness you never submitted. The undercharging. The over-earning-for-others. The who-am-I tax on every ambition. Kamala does not create worth; she sits in it — the lotus does not apologize for the mud it rose from. Her energy is not greed. It is accuracy about value. You have seen all ten loops now. Most people see one clearly — the one that runs them. If yours is now unmistakable, do not let it wait for another cycle. The loop: the discounting reflex. Worth withheld is not modesty — it is a debt left uncollected. This was Door 10 of the 10 Doors. The full letter is in your inbox.',
  },
];

/** All narration rows in one list (the bake script iterates this). */
export const allNarrationScripts = [...breathNarrationScripts, ...doorNarrationScripts];
