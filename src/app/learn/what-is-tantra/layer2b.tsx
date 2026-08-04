'use client';

import { SectionDivider } from '@/components/longform/SectionDivider';
import { ArticleSection, SectionHeading, Prose, SectionLabel } from '@/components/longform/article';
import { Blockquote } from '@/components/longform/Blockquote';

export function Layer2b_DeepHistory() {
  return (
    <>
      {/* The Texts */}
      <ArticleSection className="mt-32">
        <SectionHeading>The Texts That Carry the Tradition</SectionHeading>
        <Prose>
          <p>
            Tantra is a text-heavy tradition. Despite the emphasis on direct experience,
            the written word plays an enormous role — not as scripture to be believed,
            but as technical manual to be studied and applied. The major textual
            families are staggering in their scope and ambition.
          </p>
          <p>
            On the Hindu side, the corpus includes the Śaiva Āgamas (roughly 200 texts
            in the dualistic Śaiva Siddhānta tradition), the Bhairava Tantras (non-dual
            Śaiva traditions including Trika), the Śākta Tantras (Goddess-centered
            texts including the famous Mahānirvāṇa Tantra and the Devī Māhātmya),
            and the Nātha literature (associated with the yogic traditions of
            Matsyendranāth and Gorakhnāth). Each family contains texts on ritual,
            philosophy, yoga, mantra science, and cosmology — often within
            a single work.
          </p>
          <p>
            On the Buddhist side, the Kanjur and Tenjur collections of Tibetan
            Buddhism preserve hundreds of tantric texts translated from Sanskrit,
            many of which survive only in Tibetan. The Guhyasamāja Tantra, the
            Hevajra Tantra, the Cakrasaṃvara Tantra, and the Kālacakra Tantra
            are among the most significant. These are not popular summaries.
            They are dense, technical works that assume extensive background
            knowledge and often require years of guided study to comprehend.
          </p>
          <p>
            The scale of this textual production is itself significant. Tantra
            was not a marginal tradition practiced by a few ascetics in forests.
            It was a major intellectual and religious movement that, at its
            height, commanded the attention of kings, scholars, and ordinary
            practitioners across the Indian subcontinent and beyond.
          </p>
        </Prose>
      </ArticleSection>

      <SectionDivider
        image="/assets/tantra/Forgotten_chamber_ancient_yantra…_202608031904_3.jpeg"
        alt="Forgotten chamber with ancient yantra carvings"
        caption="Yantra carvings in a temple chamber — the geometric language of tantric practice"
      />

      {/* Geography */}
      <ArticleSection className="mt-24">
        <SectionHeading>The Geography of Tantra</SectionHeading>
        <Prose>
          <p>
            Tantra is often treated as a single Indian tradition. In reality,
            it is a pan-Asian phenomenon with distinct regional expressions
            that shaped and were shaped by local cultures, languages, and
            political structures.
          </p>
          <p>
            Kashmir was arguably the most important single center of tantric
            intellectual production. From roughly the 8th to the 12th century,
            the Kashmir Valley produced an extraordinary concentration of
            tantric scholars, practitioners, and texts. Abhinavagupta, the
            greatest tantric philosopher, lived and taught here. The Trika
            tradition reached its classical form in Kashmiri intellectual
            circles. And the Śaiva temples of the valley — many still
            standing, some in ruins — bear the architectural imprint of
            tantric ritual practice.
          </p>
          <p>
            Assam was another major center, particularly for Śākta traditions.
            The temple of Kāmākhyā at Guwahati — the site of the legendary
            yoni of Satī — became one of the most important tantric
            pilgrimage destinations in all of South Asia. The region's
            tantric traditions blended orthodox Brahminical elements with
            indigenous tribal practices, producing forms of worship that
            are distinctive to this day.
          </p>
          <p>
            Nepal maintained tantric traditions that, in many cases, preserved
            forms of practice that had disappeared or been heavily modified
            in India proper. The Kathmandu Valley's Newar Buddhist community
            maintains Vajrayāna practices that may represent some of the
            oldest continuous tantric lineages in the world. And the Śaiva
            traditions of the Kathmandu Valley produced their own rich
            corpus of tantric literature.
          </p>
          <p>
            Beyond South Asia, tantric Buddhism transformed the religious
            landscapes of Tibet, Mongolia, China, Japan, and Indonesia.
            The Borobudur temple in Java — the largest Buddhist monument
            on Earth — is a tantric mandala in architectural form. The
            Shingon tradition of Japan preserves esoteric Buddhist practices
            transmitted from China in the 9th century. Tibetan Buddhism as
            a whole is, in its formal structure, a tantric tradition —
            a fact that many Western Buddhists are only now beginning to
            fully appreciate.
          </p>
        </Prose>
      </ArticleSection>

      <ArticleSection className="mt-24">
        <Blockquote
          attribution="David Gordon White, Kiss of the Yoginī (2003)"
          source="University of Chicago Press"
        >
          Tantra was never a single, unified tradition. It was a loose network
          of ideas, practices, and social formations that coexisted, competed,
          and cross-pollinated across South Asia for more than a millennium.
          To speak of &ldquo;Tantra&rdquo; in the singular is already to distort.
        </Blockquote>
      </ArticleSection>
    </>
  );
}