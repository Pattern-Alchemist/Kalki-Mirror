'use client';

import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CinematicImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  kenBurns?: 'normal' | 'slow';
  scrim?: 'bottom' | 'full' | 'top' | 'none';
  filmGrain?: boolean;
  aspect?: string;
}

export function CinematicImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  priority = false,
  kenBurns,
  scrim = 'none',
  filmGrain = true,
  aspect,
}: CinematicImageProps) {
  const prefersReduced = useReducedMotion();
  const kbClass = prefersReduced
    ? ''
    : kenBurns === 'slow'
      ? 'ken-burns-slow'
      : kenBurns === 'normal'
        ? 'ken-burns'
        : '';
  const scrimClass =
    scrim === 'bottom' ? 'scrim-bottom' : scrim === 'full' ? 'scrim-full' : scrim === 'top' ? 'scrim-top' : '';
  const grainClass = prefersReduced ? '' : filmGrain ? 'film-grain' : '';

  return (
    <div
      className={cn(
        'cinematic-wrap',
        kbClass,
        scrimClass,
        grainClass,
        aspect,
        className
      )}
    >
      {fill ? (
        <Image src={src} alt={alt} fill priority={priority} className="object-cover" />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width ?? 1200}
          height={height ?? 800}
          priority={priority}
          className="object-cover w-full h-full"
        />
      )}
    </div>
  );
}
