'use client';

import { SectionDivider } from '@/components/longform/SectionDivider';
import { ArticleSection, SectionHeading, Prose, DropCap, SectionLabel } from '@/components/longform/article';
import { Blockquote } from '@/components/longform/Blockquote';

export function Layer5_Modern() {
  return (
    <>
      <ArticleSection className="mt-32">
        <SectionLabel>Layer V</SectionLabel>
        <SectionHeading>Why Tantra Matters Now</SectionHeading>
        <Prose>
          <DropCap>
            In the early decades of the 21st century, something unexpected
            happened. The tools of modern neuroscience began to validate
            practices that tantric traditions had developed through centuries
            of introspection and experimentation. Functional MRI studies
            showed that mantra repetition activates the default mode network
            in ways that correlate with reduced anxiety and increased
            interoceptive awareness. Research on prāṇāyāma demonstrated
            measurable effects on heart rate variability, cortisol levels,
            and autonomic nervous system balance. Studies on meditative
            visualization showed changes in brain regions associated with
            self-representation and emotional regulation.
          </DropCap>
          <p>
            None of these studies &ldquo;proved&rdquo; Tantra. That is not how
            science works, and it is not how responsible practitioners
            talk about their tradition. But they did something almost as
            important: they established that the practices Tantra developed
            produce real, measurable changes in human neurobiology and
            psychology. The introspective reports of 8th-century tantric
            practitioners and the fMRI data of 21st-century neuroscientists
            were, in many cases, pointing at the same phenomena.
          </p>
        </Prose>
      </ArticleSection>

      {/* Neuroscience */}
      <ArticleSection className="mt-24">
        <SectionHeading>The Science of Sacred Sound</SectionHeading>
        <Prose>
          <p>
            Perhaps the most striking convergence involves mantra. Tantric
            traditions have always claimed that specific Sanskrit syllables
            produce specific effects on consciousness. Modern research on
            the neuroscience of music and speech has begun to suggest why
            this might be the case. The combination of phoneme, tone, rhythm,
            and intention involved in mantra recitation engages multiple brain
            systems simultaneously — auditory processing, motor control (in
            the case of recitation), language networks, and the limbic system
            (which processes emotion and memory). This multi-system engagement
            may be why mantra practice produces effects that are difficult to
            replicate through any single modality.
          </p>
          <p>
            Research published in the International Journal of Yoga (2017)
            found that even brief periods of Om mantra recitation produced
            significant changes in autonomic nervous system balance, with
            increased parasympathetic activity (the &ldquo;rest and digest&rdquo;
            system) and decreased sympathetic arousal. A 2019 study in the
            journal Frontiers in Psychology found that mantra meditation
            reduced activity in the default mode network — the brain system
            associated with self-referential thinking and mind-wandering —
            in ways that were both stronger and more sustained than non-mantra
            meditation practices.
          </p>
          <p>
            These findings do not mean that the tantric understanding of
            mantra as &ldquo;the sonic form of deity&rdquo; is literally true
            in a scientific sense. They mean that tantric practitioners
            discovered, through centuries of rigorous introspection, a
            technology of consciousness that modern science is only now
            beginning to understand.
          </p>
        </Prose>
      </ArticleSection>

      <SectionDivider
        image="/assets/siddhi/bhairava-pathway.jpg"
        alt="Pathway leading to a Bhairava shrine at twilight"
        caption="A modern pathway to an ancient shrine — not unlike the practitioner's path into deeper awareness"
      />

      {/* Modern Misconceptions */}
      <ArticleSection className="mt-24">
        <SectionHeading>The Misconceptions That Won't Die</SectionHeading>
        <Prose>
          <p>
            Three myths about Tantra are so persistent that they deserve
            direct address.
          </p>
          <p>
            <strong className="text-foreground">Myth: Tantra is primarily about
            sex.</strong> Sexual symbolism appears in some tantric texts and
            rituals, particularly in the Vāmācāra or &ldquo;left-hand&rdquo;
            traditions. But even in those traditions, the sexual elements are
            one component of a much larger practice. The vast majority of
            tantric practice — mantra recitation, yantra meditation,
            prāṇāyāma, deity visualization — has no sexual component
            whatsoever. To reduce Tantra to sex is like reducing Christianity
            to the Eucharist. It is a part, but it is not the whole, and for
            most practitioners across most of history, it is not the most
            important part.
          </p>
          <p>
            <strong className="text-foreground">Myth: Tantra is dark or
            dangerous.</strong> Some tantric practices are intentionally
            transgressive — they violate social norms as a method of
            psychological liberation. The Pañcamakāra ritual (the &ldquo;five
            Ms&rdquo;) is the most famous example. But these practices exist
            within a carefully structured framework of preparation, initiation,
            and supervision. The tradition itself includes extensive warnings
            about the dangers of practice without proper guidance. The modern
            Western tendency to either romanticize or demonize these practices
            misses the point: they are advanced psychological tools, not
            recreational experiences.
          </p>
          <p>
            <strong className="text-foreground">Myth: Tantra can be learned
            from books or weekend workshops.</strong> Every authentic tantric
            tradition insists on initiation (dīkṣā) by a qualified teacher.
            This is not gatekeeping for its own sake. It is a recognition
            that these practices are powerful and can produce destabilizing
            psychological effects when undertaken without preparation. The
            guru-śiṣya relationship is, in psychological terms, a therapeutic
            alliance — a structured, boundaried relationship in which the
            teacher monitors the student's progress and adjusts the practice
            accordingly.
          </p>
        </Prose>
      </ArticleSection>

      {/* Closing */}
      <ArticleSection className="mt-32">
        <SectionHeading>A Living Archive</SectionHeading>
        <Prose>
          <p>
            Tantra is not a relic. It is not a historical curiosity to be
            studied and filed away. It is a living tradition with active
            lineages, practicing communities, and ongoing textual production.
            The questions it raises — about the nature of consciousness, the
            relationship between body and mind, the possibility of
            transformation through structured practice — are more relevant
            now than at any point in the last five centuries.
          </p>
          <p>
            What follows in this series is an attempt to do justice to this
            tradition: to present it with the seriousness it deserves, the
            nuance it requires, and the beauty it possesses. Each article
            will examine a specific aspect of Tantra through the five lenses
            you have encountered here — mystery, history, traditional
            understanding, psychological interpretation, and modern relevance.
          </p>
          <p>
            The archive is open. The practice is waiting. The path leads
            inward.
          </p>
        </Prose>
      </ArticleSection>
    </>
  );
}
