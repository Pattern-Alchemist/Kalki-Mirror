'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Pattern } from '@/lib/data/types';

const PATTERN_IMAGES: Record<string, string> = {
  'the-rescuer': '/assets/tantra/Pathway_to_Bhairava_shrine_202608031904_2.jpeg',
  'the-perfectionist': '/assets/tantra/Cave_with_yantras_inscriptions_202608031904_3.jpeg',
  'the-ghost': '/assets/tantra/Abandoned_Hindu_cremation_ground…_202608031904_2.jpeg',
  'the-controller': '/assets/tantra/Abandoned_tantric_temple_Indian_…_202608031904_2.jpeg',
  'the-hermit': '/assets/tantra/Forgotten_forest_shrine_ancient_…_202608031904_3.jpeg',
  'the-chameleon': '/assets/tantra/Surreal_labyrinth_black_stone_te…_202608031904_2.jpeg',
  'the-saboteur': '/assets/tantra/Underground_ritual_chamber_black…_202608031904_2.jpeg',
  'the-avoidant': '/assets/tantra/Mountain_pass_trident_twilight_s…_202608031904_2.jpeg',
  'the-martyr': '/assets/tantra/Black_granite_temple_Kali_monsoon_202608031904_2.jpeg',
  'the-pleaser': '/assets/tantra/Ancient_temple_midnight_glowing_…_202608031904_3.jpeg',
  'the-positivist': '/assets/tantra/Sri_Yantra_floating_above_Himalayas_202608031904_3.jpeg',
  'the-architect': '/assets/tantra/Ancient_observatory_with_astrola…_202608031904_3.jpeg',
};

interface PatternCardProps {
  pattern: Pattern;
  className?: string;
}

export function PatternCard({ pattern, className }: PatternCardProps) {
  const imgSrc = PATTERN_IMAGES[pattern.slug] || '/assets/patterns/labyrinth.jpg';

  return (
    <Link
      href={`/patterns/${pattern.slug}`}
      className={cn(
        'block bg-surface rounded overflow-hidden transition-transform duration-300 hover:-translate-y-1',
        'border border-border-subtle hover:border-[var(--gold)]',
        className
      )}
    >
      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={pattern.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-lg text-white leading-tight drop-shadow-lg">{pattern.name}</h3>
          <p className="text-text-secondary text-sm mt-0.5">{pattern.subtitle}</p>
        </div>
      </div>
      <div className="p-4">
        <ul className="space-y-1">
          {pattern.signs.slice(0, 2).map((s, i) => (
            <li key={i} className="text-xs text-text-muted font-ui">• {s}</li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
