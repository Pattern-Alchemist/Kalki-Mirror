'use client';

import { Timeline } from '@/components/longform/Timeline';
import { SectionDivider } from '@/components/longform/SectionDivider';
import { ArticleSection, SectionHeading, Prose, DropCap, SectionLabel } from '@/components/longform/article';
import { Blockquote } from '@/components/longform/Blockquote';

const TIMELINE_ENTRIES = [
  {
    year: 'c. 500–200 BCE',
    title: 'Proto-tantric elements emerge',
    description: 'The Atharvaveda contains hymns to domestic deities, healing charms, and apotropaic rituals — practices that later tantric traditions will systematize and expand. Early Upanishads like the Maitrī and the Śvetāśvatara introduce cosmological frameworks that Tantra will inherit.',
  },
  {
    year: 'c. 300–500 CE',
    title: 'The Guhyasamāja and early Buddhist tantras',
    description: 'In Buddhist circles, the first texts self-identifying as tantras appear. The Guhyasamāja Tantra systematizes the use of mantra, mudrā, and mandala — establishing the template for all later Vajrayāna practice.',
  },
  {
    year: 'c. 600–800 CE',
    title: 'The Śaiva Age — explosion of Hindu Tantra',
    description: 'The Śaiva Siddhānta, the Trika of Kashmir, and the Nātha traditions all produce their foundational texts. Abhinavagupta synthesizes decades of Śaiva tantric philosophy into the Tantrāloka.',
  },
  {
    year: 'c. 800–1200 CE',
    title: 'The Śākta synthesis and temple culture',
    description: 'Goddess-centered traditions reach their classical form. Temples at Kāmākhyā, Jālandhara, and Ujjain become major tantric pilgrimage centers. The Mahānirvāṇa Tantra attempts to reconcile Tantra with orthodox Brahminical norms.',
  },
  {
    year: 'c. 1200–1800 CE',
    title: 'Transmission, suppression, and survival',
    description: 'Islamic invasions disrupt temple-based practice. Tantric traditions go underground, survive in oral lineages, and resurface in new forms. The Nātha yogis become a visible presence across South Asia.',
  },
  {
    year: '1800–1950 CE',
    title: 'Colonial encounter and Orientalist construction',
    description: 'British scholars encounter tantric texts and practices. The word &ldquo;Tantrism&rdquo; is coined. Sir John Woodroffe (as &ldquo;Arthur Avalon&rdquo;) publishes the first major English-language studies, simultaneously introducing Tantra to the West and shaping its reception in ways that scholars still debate.',
  },
  {
    year: '1950–present',
    title: 'Global transmission and new questions',
    description: 'Post-colonial Indian scholars, Western academics, and practicing lineages begin a more critical, source-based study. Tantra becomes a subject of serious academic inquiry while simultaneously being commercialized and distorted in popular culture.',
  },
];

export function Layer2_History() {
  return (
    <>
      <ArticleSection className="mt-32">
        <SectionLabel>Layer II</SectionLabel>
        <SectionHeading>A History Written in the Margins</SectionHeading>
        <Prose>
          <DropCap>
            Tantra does not have a founding moment. There is no tantric equivalent of the
            Buddha&rsquo;s enlightenment under the Bodhi tree, no single revelation like the
            Qur&rsquo;ān. Instead, tantric practices and ideas emerged gradually from the
            ritual life of ancient India — from the Brahminical fire sacrifices described
            in the Vedas, from the meditative practices of forest-dwelling ascetics, from
            the devotional cults of local goddesses, and from the esoteric practices of
            Śramanic movements that existed alongside both orthodox Hinduism and Buddhism.
          </DropCap>
          <p>
            The earliest texts that scholars identify as proto-tantric appear between the
            3rd and 6th centuries CE, though their contents clearly draw on much older
            oral and ritual traditions. These early tantras are startling documents. They
            speak of the human body as a microcosm of the universe. They propose that the
            same divine energy that creates and sustains the cosmos is present, often
            dormant, within the practitioner. And they describe precise methods —
            combinations of sound (mantra), form (yantra), gesture (mudrā), and
            visualization (dhyāna) — for awakening that energy.
          </p>
        </Prose>
      </ArticleSection>

      <SectionDivider
        image="/assets/tantra/Underground_library_ancient_manu…_202608031904.jpeg"
        alt="Underground library with ancient manuscripts"
        caption="A reconstruction of the kind of manuscript library tantric scholars would have maintained"
      />

      {/* Timeline */}
      <ArticleSection className="mt-24">
        <SectionHeading>The Arc of a Tradition</SectionHeading>
        <Timeline entries={TIMELINE_ENTRIES} />
      </ArticleSection>

      {/* The Schools */}
      <ArticleSection className="mt-32">
        <SectionHeading>Not One School. A Family.</SectionHeading>
        <Prose>
          <p>
            By the 8th century CE, tantric traditions had organized themselves into
            recognizably distinct schools, each with its own textual corpus, ritual
            protocols, philosophical positions, and lineage structures. The major
            families can be grouped along two axes: religious affiliation (Śaiva,
            Śākta, Vaiṣṇava, Buddhist) and orientation (orthodox vs. transgressive).
          </p>
          <p>
            The Śaiva Siddhānta was perhaps the most socially respectable. It produced
            an enormous body of theological literature, established temple-based
            worship across South and Southeast Asia, and maintained a rigorous
            philosophical dualism between consciousness (Śiva) and matter (Śakti).
            It survives today in the ritual traditions of South Indian temples and
            among the Śaiva communities of Nepal.
          </p>
          <p>
            The Trika tradition of Kashmir took a radically different philosophical
            position. Under the genius of Abhinavagupta (c. 950–1020 CE), it proposed
            a non-dual metaphysics in which consciousness is the sole reality, and
            the entire phenomenal world is a self-expression of that consciousness.
            This is not monism in the Western sense. Abhinavagupta insisted that
            consciousness is not a static absolute but a dynamic, pulsing reality
            — eternally expanding and contracting, manifesting and dissolving, in
            a play that he called spanda, the &ldquo;throb.&rdquo;
          </p>
          <p>
            The Buddhist Vajrayāna developed in parallel, adapting tantric methods
            within a Buddhist philosophical framework. Its most distinctive
            contribution was the concept of &ldquo;enlightenment through the very
            emotions and states that other traditions regard as obstacles&rdquo; —
            a principle that would later be recognized by psychologists as a
            precursor to certain forms of exposure therapy and emotional integration.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleSection className="mt-24">
        <Blockquote
          attribution="Abhinavagupta, Tantrāloka (10th century CE)"
          source="Translated by Jaideva Singh, 1999"
        >
          The universe is not separate from consciousness. It is consciousness,
          appearing in a particular mode — just as a mirror, when colored objects
          are placed before it, appears to take on those colors, though the mirror
          itself remains untouched.
        </Blockquote>
      </ArticleSection>
    </>
  );
}