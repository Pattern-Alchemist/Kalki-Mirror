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
}

const SCRIM_STYLES: Record<string, React.CSSProperties> = {
  bottom: { background: 'linear-gradient(to top, rgba(3,3,5,0.98) 0%, rgba(3,3,5,0.7) 30%, rgba(3,3,5,0.15) 70%, transparent 100%)' },
  full: { background: 'linear-gradient(180deg, rgba(3,3,5,0.82) 0%, rgba(3,3,5,0.3) 30%, rgba(3,3,5,0.4) 60%, rgba(3,3,5,0.92) 100%)' },
  top: { background: 'linear-gradient(to bottom, rgba(3,3,5,0.85) 0%, rgba(3,3,5,0.2) 60%, transparent 100%)' },
};

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
}: CinematicImageProps) {
  const prefersReduced = useReducedMotion();
  const kbClass = prefersReduced
    ? ''
    : kenBurns === 'slow'
      ? 'ken-burns-slow'
      : kenBurns === 'normal'
        ? 'ken-burns'
        : '';
  const grainClass = prefersReduced ? '' : filmGrain ? 'film-grain' : '';

  const imageEl = fill ? (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      className="object-cover"
    />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1400}
      height={height ?? 900}
      priority={priority}
      className="object-cover w-full h-full"
    />
  );

  /* z-index layering:
     0 = image (natural)
     1 = scrim
     2 = volumetric / fog / dust (all at 2, visual overlap ok)
     3 = vignette
     4 = film-grain (topmost texture, ::after z-index:2 but rendered last)
  */

  const scrimEl = scrim !== 'none' ? (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, ...SCRIM_STYLES[scrim] }} />
  ) : null;

  const volumetricEl = volumetric && !prefersReduced ? (
    <div
      className="absolute pointer-events-none"
      style={{
        zIndex: 2,
        top: '-20%',
        left: '30%',
        width: '40%',
        height: '80%',
        background: 'linear-gradient(180deg, rgba(201,168,76,0.04) 0%, rgba(201,168,76,0.01) 40%, transparent 100%)',
        transform: 'rotate(8deg)',
        filter: 'blur(40px)',
      }}
    />
  ) : null;

  const fogEl = fog ? (
    <div
      className="absolute pointer-events-none"
      style={{
        zIndex: 2,
        bottom: 0,
        left: '-10%',
        right: '-10%',
        height: '50%',
        background: 'linear-gradient(to top, rgba(8,8,14,0.3) 0%, rgba(8,8,14,0.08) 40%, transparent 100%)',
        filter: 'blur(8px)',
      }}
    />
  ) : null;

  /* Dust — real DOM element, no ::after collision with film-grain */
  const dustEl = dust && !prefersReduced ? (
    <div className="dust-overlay" style={{ zIndex: 2 }} />
  ) : null;

  const vignetteEl = vignette ? (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 3,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 50%, rgba(0,0,0,0.45) 100%)',
      }}
    />
  ) : null;

  return (
    <div className={cn(
      'cinematic-wrap',
      fill && 'absolute inset-0',
      kbClass, grainClass, aspect, className
    )}>
      {imageEl}
      {scrimEl}
      {volumetricEl}
      {fogEl}
      {dustEl}
      {vignetteEl}
    </div>
  );
}
