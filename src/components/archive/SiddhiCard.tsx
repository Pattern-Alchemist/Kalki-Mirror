'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Siddhi } from '@/lib/data/types';
import { TIER_ORDER } from '@/lib/utils/tier-gate';
import { AuthenticityMeter } from './AuthenticityMeter';

const FALLBACK_IMAGES = [
  '/assets/siddhi/kali-temple.jpg',
  '/assets/siddhi/abandoned-temple.jpg',
  '/assets/siddhi/cremation-ground.jpg',
  '/assets/siddhi/bhairava-pathway.jpg',
  '/assets/siddhi/temple-midnight.jpg',
  '/assets/siddhi/sri-yantra.jpg',
];

function getImage(slug: string, image?: string): string {
  if (image) return image;
  const idx = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[idx];
}

interface SiddhiCardProps {
  siddhi: Siddhi;
  className?: string;
}

export function SiddhiCard({ siddhi, className }: SiddhiCardProps) {
  const locked = TIER_ORDER.indexOf(siddhi.minTier) > 0;
  const imgSrc = getImage(siddhi.slug, siddhi.image);

  return (
    <Link
      href={`/archive/${siddhi.slug}`}
      className={cn(
        'glass-chip overflow-hidden flex flex-col transition-colors duration-300',
        'hover:border-[var(--gold)] hover:border-opacity-60',
        className
      )}
    >
      {/* Image thumbnail */}
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={siddhi.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {locked && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
            <Lock className="w-3.5 h-3.5 text-gold" />
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg text-white leading-tight drop-shadow-lg">{siddhi.name}</h3>
          <p className="text-xs text-white/70 mt-0.5">{siddhi.sanskrit}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <span className="section-label w-fit">{siddhi.tradition}</span>
        <AuthenticityMeter score={siddhi.authenticityScore} />
        <span className="text-xs font-ui text-text-secondary bg-surface-elevated px-2 py-0.5 rounded w-fit">
          {siddhi.level}
        </span>
      </div>
    </Link>
  );
}
