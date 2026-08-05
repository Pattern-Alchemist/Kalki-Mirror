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
  kenBurns?: 'normal' | 'slow' | 'none';
  scrim?: 'bottom' | 'full' | 'top' | 'none';
  filmGrain?: boolean;
  vignette?: boolean;
  volumetric?: boolean;
  fog?: boolean;
  dust?: boolean;
  aspect?: string;
  colorGrade?: boolean;
}

export function CinematicImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  priority = false,
  kenBurns = 'none',
  scrim = 'none',
  filmGrain = true,
  vignette = false,
  volumetric = false,
  fog = false,
  dust = false,
  aspect,
  colorGrade = true,
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
  const vignetteClass = vignette ? 'vignette' : '';
  const volumetricClass = volumetric ? 'volumetric-light' : '';
  const fogClass = fog ? 'atmospheric-fog' : '';
  const dustClass = prefersReduced ? '' : dust ? 'dust-particles' : '';
  const gradeClass = colorGrade ? '' : 'no-grade';

  return (
    <div
      className={cn(
        'cinematic-wrap',
        kbClass,
        scrimClass,
        grainClass,
        vignetteClass,
        volumetricClass,
        fogClass,
        dustClass,
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
          width={width ?? 1400}
          height={height ?? 900}
          priority={priority}
          className="object-cover w-full h-full"
        />
      )}
    </div>
  );
}
