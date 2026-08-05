'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { Blockquote } from '@/components/longform/Blockquote';
import { ArticleSection, SectionHeading, Prose, DropCap } from '@/components/longform/article';
import { fadeInUp } from '@/lib/motion/tokens';

export function Layer1_Mystery() {
  const reduced = useReducedMotion();
  return (
    <>
      {/* === OPENING === */}
      <section className="relative h-screen flex items-center justify-center">
        <CinematicImage
          src="/assets/tantra/temple-midnight.jpeg"
          alt="Ancient temple at midnight with dim ritual glow"
          kenBurns="slow"
          scrim="full"
          priority
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Series Pilot · The Forbidden World of Tantra
          </motion.p>
          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl gold-foil-text leading-[0.95] mb-8"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            What if everything you have heard about Tantra is only five percent of the story?
          </motion.h1>
          <motion.p
            className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            The most misunderstood spiritual tradition on Earth — and why scholars, psychologists, and practitioners keep returning to it.
          </motion.p>
        </div>
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-gold-dim" />
        </motion.div>
      </section>

      {/* === THE PARADOX === */}
      <ArticleSection className="mt-32">
        <SectionHeading>The Word Itself</SectionHeading>
        <Prose>
          <DropCap>
            In the Sanskrit of the earliest sources, the word tantra most literally means
            &ldquo;loom&rdquo; — the apparatus on which cloth is woven, thread by thread, into
            something that did not exist before. It carries the sense of a systematic
            framework, a technology of transformation built from precise, interlocking
            components. The root tan means &ldquo;to expand&rdquo; or &ldquo;to stretch.&rdquo; Tra
            means &ldquo;to liberate&rdquo; or &ldquo;to save.&rdquo; A tantra, then, is that which
            expands consciousness and liberates the practitioner.
          </DropCap>
          <p>
            That is the etymology. It is precise, grounded, and utterly at odds with what
            the word has come to mean in the languages and imaginations of the modern world.
            In bookstores from Berlin to Bangalore, &ldquo;Tantra&rdquo; now indexes something closer
            to sexual technique than to spiritual philosophy. On social media, it is a
            hashtag for wellness content. In certain corners of the internet, it is treated
            as a form of dark occultism. And in popular cinema, it functions as shorthand
            for forbidden power.
          </p>
          <p>
            None of these meanings are entirely wrong. But each captures at most a single
            thread from a fabric so vast and complex that it has taken scholars more than
            a century just to map its outlines. Tantra is not one thing. It is a family of
            traditions — some fully aligned with orthodox Hinduism and Buddhism, some
            deliberately transgressive, some primarily philosophical, some primarily ritual,
            and some that dissolve the boundary between all of these categories entirely.
          </p>
        </Prose>
      </ArticleSection>

      {/* === THE QUESTION === */}
      <ArticleSection className="mt-24">
        <Blockquote
          attribution="Dr. Shaman Hatley, University of Massachusetts Boston"
          source="Conference on Tantra, Oxford University, 2019"
        >
          The fundamental problem in the study of Tantra is that the word has been asked to
          carry more weight than any single term can bear. It refers simultaneously to texts,
          rituals, philosophies, lineages, and social movements that span fifteen centuries
          and at least three major religious traditions.
        </Blockquote>
      </ArticleSection>

      {/* === SCOPE === */}
      <ArticleSection className="mt-24">
        <SectionHeading>A Tradition That Refuses to Be One Thing</SectionHeading>
        <Prose>
          <p>
            Consider the range. At one end of the tantric spectrum sits the Śrī Vidyā
            tradition — one of the most systematic, philosophically rigorous, and widely
            practiced forms of devotional worship in all of Hinduism. Its practitioners
            meditate on the Śrī Cakra, a geometric arrangement of nine interlocking
            triangles that represents the totality of creation and dissolution. The
            tradition has produced hundreds of commentaries, a continuous lineage of
            teachers spanning more than a millennium, and a body of ritual practice so
            precise that each gesture, each syllable, each visualized form has been
            debated and refined across generations.
          </p>
          <p>
            At the other end sit the Kāpālika traditions — ascetic practitioners who, in
            medieval India, carried skulls as begging bowls, lived in cremation grounds,
            and practiced rituals explicitly designed to invert social norms. These were
            not fringe figures. They appear in the literary record as characters in
            Sanskrit drama, as subjects of royal patronage, and as participants in
            theological debates. Some of their practices survive today in modified form
            within the Aghorī traditions of Varanasi.
          </p>
          <p>
            Both of these are Tantra. So is the sophisticated philosophical system known
            as Kashmir Śaivism, which proposes that consciousness is the fundamental
            substance of reality — a position that has attracted the attention of both
            comparative philosophers and cognitive scientists. So is the Buddhist Vajrayāna
            tradition, which carried tantric methods from India to Tibet, Mongolia, Japan,
            and Indonesia, and produced some of the most psychologically sophisticated
            meditation practices ever developed.
          </p>
          <p>
            To understand Tantra is not to choose among these expressions. It is to
            recognize that they share a common architecture — a set of assumptions about
            the nature of reality, the human mind, and the path to liberation — even as
            they differ wildly in their methods, aesthetics, and social contexts.
          </p>
        </Prose>
      </ArticleSection>
    </>
  );
}