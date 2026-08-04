'use client';

import { SectionDivider } from '@/components/longform/SectionDivider';
import { ArticleSection, SectionHeading, Prose, DropCap, SectionLabel } from '@/components/longform/article';
import { Blockquote } from '@/components/longform/Blockquote';
import { Footnote } from '@/components/longform/Footnote';

export function Layer3_Tradition() {
  return (
    <>
      <ArticleSection className="mt-32">
        <SectionLabel>Layer III</SectionLabel>
        <SectionHeading>What Tantra Actually Teaches</SectionHeading>
        <Prose>
          <DropCap>
            Strip away the sensationalism, the colonial baggage, the modern
            marketing, and you are left with a set of ideas so radical that they
            challenge the foundations of how most spiritual traditions operate.
            The first and most important: Tantra does not seek to escape the world.
            It seeks to transform it — and the practitioner — from within.
          </DropCap>
          <p>
            This is the decisive break from traditions that view the material world
            as illusory, or as a place of suffering to be transcended. Tantra
            proposes instead that the world is real, that the body is real, that
            desire is real, and that liberation is not achieved by rejecting any
            of these but by mastering them. Not suppressing desire. Not
            transcending the body. Not escaping the world. Entering more deeply
            into each, with such precision and awareness that the practitioner
            discovers the divine reality that was always present within them.
          </p>
          <p>
            This principle expresses itself through four primary tools, each of
            which has been refined over more than a millennium of practice.
          </p>
        </Prose>
      </ArticleSection>

      {/* The Four Tools */}
      <ArticleSection className="mt-24">
        <SectionHeading>The Four Pillars of Practice</SectionHeading>
        <Prose>
          <p>
            <strong className="text-foreground">Mantra</strong> — the science of sacred sound.
            In the tantric framework, the universe is vibration. Every deity, every
            state of consciousness, every aspect of reality has a sonic correlate —
            a specific combination of syllables that, when pronounced with precise
            technique, resonates with that aspect of reality within the practitioner.
            <Footnote id="1">The Sanskrit term for this is śabda-brahman — the concept
            that ultimate reality is fundamentally sonic in nature. This idea has
            intriguing parallels with string theory in modern physics, though scholars
            caution against drawing too direct a connection.</Footnote>
          </p>
          <p>
            <strong className="text-foreground">Yantra</strong> — the geometry of consciousness.
            If mantra is the sound-form of a deity or principle, yantra is its visual
            form. The most famous is the Śrī Cakra — nine interlocking triangles
            inscribed within a lotus-and-circle framework. But yantras range from
            simple diagrams to complex multi-layered compositions. They function
            as meditation supports, as ritual objects, and as maps of the subtle
            body. Practitioners do not worship the yantra as an idol. They use it
            as an instrument for focusing and directing attention.
          </p>
          <p>
            <strong className="text-foreground">Mudrā</strong> — the language of gesture.
            Tantric mudrās are not decorative. Each gesture seals a specific
            energetic or psychological state — connecting the practitioner to the
            aspect of reality the gesture represents. The term nyāsa, closely
            related, refers to the practice of &ldquo;placing&rdquo; mantras on
            different parts of the body, ritually consecrating the physical form
            as a living temple.
          </p>
          <p>
            <strong className="text-foreground">Dhyāna</strong> — directed contemplation.
            Tantric meditation is not empty sitting. It is vivid, structured, and
            often emotionally intense. The practitioner visualizes specific deities,
            traverses imagined landscapes, and invokes specific emotional states
            — not as fantasies, but as precisely calibrated psychological tools.
            The deity is not a god to be pleased. It is an archetype to be
            internalized.
          </p>
        </Prose>
      </ArticleSection>

      <SectionDivider
        image="/assets/tantra/Sri_Yantra_floating_above_Himalayas_202608031904.jpeg"
        alt="Śrī Yantra floating above Himalayan peaks"
        caption="The Śrī Cakra — central yantra of the Śrī Vidyā tradition"
      />

      {/* Śakti */}
      <ArticleSection className="mt-24">
        <SectionHeading>The Principle of Śakti</SectionHeading>
        <Prose>
          <p>
            Underlying all tantric practice is a single metaphysical principle:
            Śakti — divine energy, cosmic power, the active dimension of reality.
            In most tantric systems, Śakti is personified as the Goddess (Devī),
            and the relationship between Śakti and the static principle of
            consciousness (Śiva) is the fundamental dynamic of the universe.
          </p>
          <p>
            This is not merely theology. It has practical consequences. If the
            universe is powered by Śakti, and if Śakti is present within the human
            body — specifically, according to most tantric traditions, in a
            dormant form at the base of the spine — then the task of spiritual
            practice is not to acquire something from outside but to awaken what
            is already there. The tantric practitioner is, in this sense, an
            engineer of consciousness rather than a supplicant before a distant god.
          </p>
          <p>
            The concept of kuṇḍalinī — the coiled energy at the base of the
            spine — is the most famous expression of this principle. Though
            often distorted in popular accounts, in its original tantric context
            kuṇḍalinī refers to a specific experience of energy rising through
            the subtle body, through a system of cakras (energy centers),
            producing progressively deeper states of awareness. The practices
            that facilitate this awakening — prāṇāyāma, bandha, mudrā, and
            mantra — form a technology of consciousness that has no real
            equivalent in Western psychological or spiritual traditions.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleSection className="mt-24">
        <Blockquote
          attribution="Lakṣmaṇa Deśika, commentary on the Saundaryalaharī"
          source="c. 15th century CE"
        >
          Śakti without Śiva is inert. Śiva without Śakti is powerless. It is
          only when the two are united that creation, preservation, and
          dissolution become possible — in the cosmos and in the heart of
          the practitioner.
        </Blockquote>
      </ArticleSection>
    </>
  );
}
