'use client';

import { Layer1_Mystery } from './layer1';
import { Layer2_History } from './layer2';
import { Layer2b_DeepHistory } from './layer2b';
import { Layer3_Tradition } from './layer3';
import { Layer3b_LeftHand } from './layer3b';
import { Layer4_Psychology } from './layer4';
import { Layer4b_DeepPsychology } from './layer4b';
import { Layer5_Modern } from './layer5';
import { KnowledgeLinks } from '@/components/longform/KnowledgeLinks';

const NEXT_LINKS = [
  {
    href: '/archive/dakshina-kali-sadhana',
    label: 'Dakṣiṇā Kālī Sādhana',
    description: 'The most direct expression of tantric shadow integration — the Goddess of time, death, and liberation.',
    type: 'siddhi' as const,
  },
  {
    href: '/archive/sri-yantra-dhyana',
    label: 'Śrī Yantra Dhyāna',
    description: 'Geometry as theology — the nine-triangle yantra as a map of consciousness and a meditation tool.',
    type: 'siddhi' as const,
  },
  {
    href: '/patterns/the-rescuer',
    label: 'The Rescuer Pattern',
    description: 'The psychological pattern most targeted by tantric deity identification practices.',
    type: 'pattern' as const,
  },
  {
    href: '/practice',
    label: 'Begin a Sādhana',
    description: 'Start with Nāḍī Śuddhi — the foundational breath practice that appears in virtually every tantric tradition.',
    type: 'practice' as const,
  },
  {
    href: '/method',
    label: 'The Mirror Method',
    description: 'AstroKalki\'s framework for connecting tantric sādhanas to your own psychological patterns.',
    type: 'method' as const,
  },
  {
    href: '/research',
    label: 'Sources & Methodology',
    description: 'How we score authenticity, evaluate evidence, and distinguish tradition from interpretation.',
    type: 'research' as const,
  },
];

export default function WhatIsTantraPage() {
  return (
    <article className="bg-deep-black">
      <Layer1_Mystery />
      <Layer2_History />
      <Layer2b_DeepHistory />
      <Layer3_Tradition />
      <Layer3b_LeftHand />
      <Layer4_Psychology />
      <Layer4b_DeepPsychology />
      <Layer5_Modern />

      {/* Epistemic Note */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="glass-chip p-8">
          <p className="section-label mb-3">Epistemic Note</p>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            This article draws on primary textual sources (the Tantrāloka, the Mahānirvāṇa Tantra, the
            Guhyasamāja Tantra), secondary scholarship (White 2003, Urban 2009, Hatley 2007, Wallis 2013),
            and modern neuroscience research (Telles et al. 2017, Kral et al. 2019). Where this article
            offers interpretation, it is flagged as such. Where it presents traditional claims, they are
            attributed to their source. Where it speculates, it says so. This is the standard AstroKalki
            applies to every piece of content.
          </p>
          <p className="text-text-muted text-xs">
            No AI-generated content is presented as traditional knowledge. Every connection between
            tantric practice and modern psychology is offered as interpretive framing, not as traditional
            teaching.
          </p>
        </div>
      </div>

      {/* Knowledge Graph — Explore Next */}
      <div className="max-w-4xl mx-auto px-6 pb-32">
        <KnowledgeLinks links={NEXT_LINKS} />
      </div>
    </article>
  );
}
