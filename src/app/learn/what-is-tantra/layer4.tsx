'use client';

import { ArticleSection, SectionHeading, Prose, DropCap, SectionLabel } from '@/components/longform/article';
import { Blockquote } from '@/components/longform/Blockquote';

export function Layer4_Psychology() {
  return (
    <>
      <ArticleSection className="mt-32">
        <SectionLabel>Layer IV</SectionLabel>
        <SectionHeading>What Human Problem Was Tantra Solving?</SectionHeading>
        <Prose>
          <DropCap>
            Every enduring spiritual tradition addresses a specific set of human
            problems. Buddhism addresses suffering. Stoicism addresses the
            tyranny of external events. Confucianism addresses social harmony.
            Tantra addresses something more fundamental and more uncomfortable:
            the problem of fragmentation.
          </DropCap>
          <p>
            The tantric diagnosis is that the human being, in its ordinary state,
            is split — split between body and mind, between desire and morality,
            between the conscious self and the vast unconscious terrain that
            lies beneath it. These splits are not merely psychological. They are
            experienced as existential: a sense that something essential is missing,
            that one is living at a fraction of one's capacity, that the life one
            is living is not the life one was meant to live.
          </p>
          <p>
            Tantra's answer is not self-improvement. It is integration. The
            practitioner does not seek to become better, purer, or more spiritual.
            The practitioner seeks to become whole — to include within awareness
            every aspect of experience, including those that other traditions
            label as obstacles: desire, anger, fear, grief, and the raw intensity
            of physical existence.
          </p>
        </Prose>
      </ArticleSection>

      {/* Jung Connection */}
      <ArticleSection className="mt-24">
        <SectionHeading>The Shadow and the Goddess</SectionHeading>
        <Prose>
          <p>
            It is no accident that Carl Jung, the founder of analytical psychology,
            was profoundly interested in tantric texts. Jung spent decades studying
            Eastern philosophical systems, and his concept of the shadow — the
            disowned, rejected, or unknown aspects of the personality — finds a
            striking parallel in the tantric practice of embracing rather than
            transcending desire, anger, and other &ldquo;negative&rdquo; states.
          </p>
          <p>
            In Jungian terms, the tantric practitioner does not repress the shadow.
            The practitioner enters into relationship with it — consciously,
            deliberately, with specific ritual tools as mediators. The deity
            Kālī, who appears terrifying to the uninitiated, is perhaps the
            most direct expression of this principle. She is the shadow in divine
            form: death, time, destruction, the end of all things — and yet
            she is also the mother, the liberator, the one who grants the
            practitioner's deepest desire. To meditate on Kālī is to sit with
            everything the conscious mind most wants to avoid, and to discover
            that what was feared is also a source of power.
          </p>
          <p>
            Modern psychologists would recognize this as a form of exposure —
            systematic, graduated contact with feared or avoided internal states,
            conducted in a safe, structured, and ritually contained environment.
            The difference is that Tantra has been doing this for more than a
            millennium, with a sophistication that modern therapeutic approaches
            are only now beginning to approach.
          </p>
        </Prose>
      </ArticleSection>

      {/* The Specific Problems */}
      <ArticleSection className="mt-24">
        <SectionHeading>Five Problems Tantra Was Designed to Solve</SectionHeading>
        <Prose>
          <p>
            <strong className="text-foreground">Fear of death.</strong> Tantric
            traditions include practices specifically designed to confront mortality
            — meditation in cremation grounds, visualization of the decomposition
            of the body, contemplation of the impermanence of all things. The
            Kāpālika and Aghorī traditions are the most dramatic examples, but the
            principle appears across virtually all tantric schools. The psychological
            function is clear: by repeatedly exposing the practitioner to the reality
            of death in a controlled ritual context, the practice reduces death
            anxiety and produces a quality of fearlessness that practitioners
            consistently report.
          </p>
          <p>
            <strong className="text-foreground">Identity rigidity.</strong> Most
            people operate within a narrow band of self-concept: &ldquo;I am this
            kind of person.&rdquo; Tantra systematically dismantles this rigidity.
            Through deity identification (the practice of visualizing oneself as a
            specific deity), the practitioner temporarily adopts an entirely
            different identity — one that may include qualities they have disowned.
            Over time, this practice produces a more fluid, less reactive sense of
            self.
          </p>
          <p>
            <strong className="text-foreground">Attachment and loss.</strong> Tantric
            philosophy proposes that attachment is not the problem — clinging
            is. The practice of non-attachment within Tantra is not withdrawal from
            the world but full engagement with it, accompanied by the awareness
            that everything is temporary. This is remarkably close to what modern
            acceptance-and-commitment therapy (ACT) calls &ldquo;psychological
            flexibility.&rdquo;
          </p>
          <p>
            <strong className="text-foreground">Unconscious repetition.</strong> The
            Sanskrit term samskāra refers to habitual patterns — the deeply
            grooved behavioral and emotional loops that run a person's life without
            their conscious awareness. This is almost exactly what modern psychology
            calls procedural memory or conditioned responses. Tantric practice
            — particularly mantra repetition (japa) and visualization — works
            directly on samskāras by creating new, more conscious patterns.
          </p>
          <p>
            <strong className="text-foreground">The need for direct experience.</strong>
            Tantra is fundamentally anti-authoritarian in a way that surprises many
            people. While it places enormous emphasis on the guru-śiṣya relationship,
            the goal is never belief. The goal is direct, first-person experience
            of the states the texts describe. A practitioner who merely believes
            the teachings without experiencing them is, in the tantric framework,
            no better off than someone who has never heard them at all.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleSection className="mt-24">
        <Blockquote
          attribution="Carl Gustav Jung, The Psychology of Kundalini Yoga (1932)"
          source="Based on seminars delivered at the ETH Zurich"
        >
          When you begin to meditate on the Kundalini, you are beginning an
          adventure that is comparable to the exploration of an unknown
          continent. You are entering the unconscious, and the experiences
          you will encounter there are as real as anything in the external world.
        </Blockquote>
      </ArticleSection>
    </>
  );
}
