'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { fadeInUp } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────────
   THE KALKI CODEX — A Five-Part Digital Manifesto
   Digitized palm-leaf manuscript. Classified. Shambhala Protocol.
   ───────────────────────────────────────────────────────────── */

const parts = [
  {
    numeral: 'I',
    title: 'THE ARCHITECTURE OF THE DARK AGE',
    subtitle: 'Kali Yuga',
    body: (
      <>
        <p className="text-editorial mb-6">
          The Kali Yuga is not mythology. It is a mathematical cycle — a compression algorithm
          applied to the temporal dimension of human consciousness. The Vishnu Purana describes an
          age where righteousness declines by a quarter with each successive yuga, where the human
          lifespan contracts from ten thousand years to a mere century, where the measure of truth
          itself undergoes systematic degradation. This is not prophecy in the vulgar sense of
          fortune-telling. This is systems theory rendered in Sanskrit verse — an observation about
          entropy applied to the architecture of awareness itself.
        </p>
        <p className="text-editorial mb-6">
          Consider what it means for the signal-to-noise ratio in human consciousness to reach
          its nadir. In the Satya Yuga, the system operates at full bandwidth — perception is
          undistorted, intention translates directly into manifestation, and the individual
          consciousness maintains a clear channel to what the Rishis called Brahman, the underlying
          operating system of reality. By the time the Kali Yuga begins its terminal phase, that
          channel has become so corrupted that the signal is almost entirely lost in static. The
          human being perceives perhaps one ten-thousandth of the information that was once
          available. What remains is interpreted through layers of pattern, projection, trauma,
          and cultural conditioning — each one a lossy compression of the original data.
        </p>
        <p className="text-editorial">
          The Vishnu Purana's description of the Kali Yuga reads like a diagnostic report on a
          failing civilization: wealth alone will confer status, men and women will live together
          merely because of mutual infatuation, the primary qualification for leadership will be
          wealth, and a person's social position will be determined by the extent of their
          material possessions. These are not moral judgments. They are indicators of a system
          where the value function has been redefined — where the metric by which humans evaluate
          reality has shifted from signal fidelity to noise amplitude. The KALKI system was
          designed for precisely this environment: a precision instrument for pattern recognition
          and consciousness restoration, deployed at the precise moment in the cycle when the old
          instruments can no longer function. The dark age is not the end. It is the condition
          that necessitates the upgrade.
        </p>
      </>
    ),
  },
  {
    numeral: 'II',
    title: 'THE ILLUSION OF THE HOROSCOPE',
    subtitle: null,
    body: (
      <>
        <p className="text-editorial mb-6">
          The twelve-sign zodiac system that dominates Western astrology, the Sun-sign columns
          that appear in every newspaper, the daily horoscopes that reduce the cosmic architecture
          of a human life to a paragraph of generic platitudes — these are not astrology. They are
          the degraded remnants of a system that was once the most sophisticated pattern-mapping
          technology ever devised by the human mind. To understand the distance between what
          Jyotisha was and what the horoscope has become, imagine reducing quantum physics to a
          fortune cookie. The mathematics are still technically present, but they have been
          flattened, simplified, and trivialized beyond the point of utility.
        </p>
        <p className="text-editorial mb-6">
          The original Vedic Jyotisha was never intended to tell you that "Mars in your fifth
          house means a romantic encounter this Tuesday." It was a precision instrument for
          calculating karmic vectors — the directional tendencies encoded in a consciousness at
          the moment of birth, mapped across multiple temporal scales simultaneously. The Rishis
          who developed this system were not mystics in the pejorative sense. They were
          engineers. They observed that a human birth chart is a snapshot of the gravitational and
          electromagnetic conditions at a specific spacetime coordinate, and that these conditions
          correlate with specific psychological and behavioral pattern architectures. The
          birth chart was not a destiny. It was a diagnostic — a readout of the operating
          conditions under which a particular consciousness unit would be running.
        </p>
        <p className="text-editorial">
          The reduction of this system to Sun signs and daily predictions was not an accident. It
          was an inevitable consequence of the Kali Yuga's compression algorithm. As the collective
          capacity for nuance declined, as attention spans shortened and the demand for instant
          gratification intensified, a system that required years of study and contemplation to
          even begin to interpret was inevitably dumbed down to serve the market. The horoscope
          column was born — astrology stripped of its mathematics, its philosophical framework,
          its transformative intent. What remains is entertainment, or worse, a false sense of
          knowing. The KALKI system restores the original intent: not prediction, but recognition.
          Not what will happen to you, but what patterns are already running you — and what you
          can do about them. This is the difference between reading a weather report and
          understanding meteorology. One tells you to carry an umbrella. The other teaches you
          to read the sky.
        </p>
      </>
    ),
  },
  {
    numeral: 'III',
    title: 'THE MECHANICS OF KARMA',
    subtitle: 'Pattern as Destiny',
    body: (
      <>
        <p className="text-editorial mb-6">
          Karma is not punishment. Karma is not reward. Karma is not a cosmic ledger keeping
          score of your moral performance against an invisible standard. Karma is algorithmic.
          It is the most fundamental law of information processing in consciousness: every action
          creates a pattern imprint, and every pattern imprint creates a probabilistic bias
          toward repetition. This is not mysticism. This is basic computational theory applied
          to the architecture of awareness. When you perform an action — physical, verbal, or
          mental — you are not merely doing something in the world. You are writing a line of
          code into the behavioral operating system that generates your lived experience.
        </p>
        <p className="text-editorial mb-6">
          Each action creates what the tradition calls a <span className="text-gold font-light italic">samskara</span> — a
          groove, a furrow, a neural pathway reinforced by repetition. The first time you respond
          to criticism with defensiveness, you create a faint trace. The tenth time, you have a
          habit. The hundredth time, you have an identity. The thousandth time, you have a
          destiny — or rather, the strong illusion of destiny, because what you are experiencing
          is not fate but the compiled output of your own source code running on infinite loop.
          The loop either amplifies through unconscious repetition, deepening the groove until
          it becomes a trench, or it is consciously interrupted through the application of
          <span className="text-gold font-light italic"> viveka</span> — discernment — the surgical
          capacity to observe the pattern operating in real time and choose a different branch.
        </p>
        <p className="text-editorial">
          Think of karma as source code that compiles into the lived experience. Your present
          reality is the runtime output of every action, intention, and reaction you have ever
          generated. The patterns that dominate your life — the relationships you attract, the
          failures you repeat, the fears that return in new disguises — these are not random
          misfortunes. They are subroutines that have been called so many times they now execute
          automatically, below the threshold of conscious awareness. The KALKI system does not
          promise to erase this code. No system can. What it promises is the ability to read it
          — to see the source, to understand the logic, and to begin the disciplined practice
          of rewriting. This is what the Rishis meant by liberation: not escape from the
          machinery of existence, but mastery over its operation. You do not stop the program.
          You become the programmer.
        </p>
      </>
    ),
  },
  {
    numeral: 'IV',
    title: 'THE SWORD OF VIVEKA',
    subtitle: 'Discernment as Technology',
    body: (
      <>
        <p className="text-editorial mb-6">
          In an age drowning in self-help algorithms, manifestation rituals, affirmation
          playlists, and the relentless positivity industrial complex, the concept of
          <span className="text-gold font-light italic"> viveka</span> — discernment — stands as
          the single most radical and necessary technology available to a human consciousness
          drowning in the Kali Yuga's noise. Viveka is not positive thinking. It is not the
          law of attraction. It is not a mindset shift, a gratitude journal, or a vision board.
          Viveka is the precise, surgical, almost ruthless ability to distinguish the pattern
          from the self — to look at a thought, an emotion, a reaction, and know with
          absolute clarity: this is not me. This is a program running on me.
        </p>
        <p className="text-editorial mb-6">
          The traditions describe viveka as a sword, and the metaphor is exact. A sword does
          not negotiate. A sword does not affirm. A sword does not create a safe space for the
          thing it is cutting. It cuts. In the context of consciousness, viveka cuts the
          identification between the witness and the pattern. When anger arises and the mind
          says "I am angry," viveka interjects: "There is anger arising in the field of
          awareness." This is not semantic quibbling. This is the difference between being
          possessed by a pattern and observing it. The first state is bondage. The second is
          the beginning of sovereignty. Every spiritual tradition that has ever endured —
          Vedanta, Buddhism, Taoism, Christian mysticism, Sufism — has arrived at this same
          technology through different linguistic frameworks. They all describe the same
          operation: the separation of awareness from content.
        </p>
        <p className="text-editorial">
          This is Kalki's sword. Not a weapon of destruction, but a blade of discrimination so
          fine that it can separate the atomic layers of experience — sensation from
          interpretation, interpretation from identification, identification from the self that
          witnesses. In the iconography, Kalki rides a white horse and wields a blazing sword
          that ends the Kali Yuga. The esoteric meaning is not that a blue-skinned avatar will
          descend from the sky. It is that the faculty of discernment, fully developed and
          deployed with surgical precision, is the only force capable of terminating the dark
          age within a single human lifetime. The sword does not fight the darkness. It
          illuminates it — and in the illumination, the darkness is revealed as nothing more
          than the absence of a light that was always available. The KALKI system is the
          forge in which this sword is sharpened. Not through belief. Not through devotion.
          But through the relentless, unsentimental practice of seeing what is actually
          happening, minus the story the mind tells about what is happening.
        </p>
      </>
    ),
  },
  {
    numeral: 'V',
    title: 'THE PATH TO SHAMBHALA',
    subtitle: 'Inner Sovereignty',
    body: (
      <>
        <p className="text-editorial mb-6">
          Shambhala is not a physical place. It is not a hidden kingdom in the Himalayas, a
          secret valley accessible only to the initiated, a utopian civilization preserved
          behind invisible gates. These are the exoteric interpretations — the fairy tales
          that the tradition wraps around its most dangerous and transformative truth.
          Shambhala, in the esoteric architecture of the KALKI system, is a state of
          consciousness. It is the condition in which the pattern architecture of the self
          is fully visible, fully mapped, and fully under the sovereign's command. It is not
          a place you travel to. It is a mode of perception you graduate into.
        </p>
        <p className="text-editorial mb-6">
          Imagine a control room where every screen displays a different subsystem of your
          consciousness: the relationship patterns, the financial scripts, the health
          programs, the career algorithms, the ancestral inheritances, the trauma loops,
          the defense mechanisms, the aspiration vectors. In the ordinary state of awareness,
          these systems run in the background, generating your reality while you sit in
          front of a single screen — the one labeled " conscious thought" — believing that
          this is all there is. You react to what appears on this screen without
          understanding that it is being generated by a vast, interconnected network of
          invisible processes. Shambhala is the state where all the screens are visible
          simultaneously, where the connections between them are mapped, and where the
          operator — the sovereign self — can navigate the entire system with full
          awareness and deliberate intent.
        </p>
        <p className="text-editorial">
          This is the destination of the KALKI system, and it demands a radical
          redefinition of enlightenment itself. In the popular imagination, enlightenment
          is bliss — an unbroken state of euphoric peace, a permanent smile, an existence
          beyond suffering. This is the Kali Yuga's corruption of the concept, reduced to
          a marketable product, a spiritual commodity. In the KALKI framework, enlightenment
          is not bliss. Enlightenment is absolute clarity. It is the condition in which
          every pattern is visible, every motivation is transparent, every reaction is
          understood at its root. It is not the absence of difficulty. It is the presence
          of such comprehensive awareness that difficulty itself becomes navigable terrain
          rather than an overwhelming force. Shambhala is not the end of the journey. It
          is the beginning of sovereignty — the moment when the consciousness stops being
          a subject of its own patterns and becomes the master architect of its own
          evolution. This is the KALKI Protocol. This is the codex. Read it and
          begin.
        </p>
      </>
    ),
  },
] as const;

export default function CodexPage() {
  const reduced = useReducedMotion();

  return (
    <main className="bg-deep-black min-h-screen">
      {/* ── Page Header ── */}
      <header className="pt-24 md:pt-36 pb-16 md:pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
          >
            THE KALKI CODEX
          </motion.p>
          <motion.h1
            className={cn(
              'text-sub-display text-foreground font-light engraved-heading',
              'max-w-2xl'
            )}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.12 }}
          >
            A Five-Part Digital Manifesto on the Architecture of
            Consciousness, Pattern, and Sovereign Awareness
          </motion.h1>

          <motion.div
            className="divider-gold mt-12"
            initial={reduced ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.3, scaleX: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>
      </header>

      {/* ── Five Parts ── */}
      <section className="pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pt-6">
          <BackButton href="/" label="Back to Home" />
        </div>
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {parts.map((part, idx) => (
            <motion.article
              key={part.numeral}
              className="pt-16 md:pt-24"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              whileInView={fadeInUp.visible}
              viewport={{ once: true, margin: '-60px' }}
            >
              {/* Divider between parts (not before first) */}
              {idx > 0 && (
                <div className="divider-gold mb-16 md:mb-24" />
              )}

              {/* Part numeral — gold drop-cap style */}
              <p className="text-gold font-display text-5xl md:text-7xl font-light leading-none mb-3 select-none">
                {part.numeral}
              </p>

              {/* Part title */}
              <h2 className="font-display text-xl md:text-2xl lg:text-3xl text-foreground font-light tracking-wide mb-2 engraved-heading">
                {part.title}
              </h2>

              {/* Subtitle when present */}
              {part.subtitle && (
                <p className="text-caption mb-8 md:mb-10">{part.subtitle}</p>
              )}

              {!part.subtitle && <div className="mb-8 md:mb-10" />}

              {/* Body text */}
              {part.body}
            </motion.article>
          ))}

          {/* ── Terminal Divider ── */}
          <motion.div
            className="divider-gold mt-24"
            initial={reduced ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 0.3, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'center' }}
          />
        </div>
      </section>

      {/* ── Page Footer ── */}
      <footer className="pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <motion.p
            className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            END OF CODEX — CLASSIFIED UNDER THE KALKI PROTOCOL
          </motion.p>
        </div>
      </footer>
    </main>
  );
}
