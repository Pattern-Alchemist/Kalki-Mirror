'use client';

import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

function cloudinaryUrl(cloudinaryId: string, width = 1920): string {
  if (!CLOUD) return '';
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto:good,w_${width},c_limit/${cloudinaryId}`;
}

/**
 * Generate responsive srcset for Cloudinary URLs.
 * Parses a full Cloudinary URL, replaces the width transform,
 * and returns srcset string with mobile-appropriate breakpoints.
 */
function buildResponsiveSrcset(src: string): string | undefined {
  const match = src.match(/\/image\/upload\/([^/]+)\/(.+)/);
  if (!match) return undefined;
  const transforms = match[1];
  const publicId = match[2];
  // Extract existing quality/format if present
  const hasFormat = transforms.includes('f_auto');
  const baseTransforms = hasFormat ? transforms : `f_auto,${transforms}`;
  const breakpoints = [640, 768, 1024, 1280, 1920];
  return breakpoints
    .map(w => `https://res.cloudinary.com/${CLOUD || 'b9oo5abp'}/image/upload/${baseTransforms.replace(/w_\d+/, `w_${w}`)}/${publicId} ${w}w`)
    .join(', ');
}

interface CinematicImageProps {
  src?: string;
  cloudinaryId?: string;
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
  bottom: { background: 'linear-gradient(to top, rgba(11,12,16,0.98) 0%, rgba(11,12,16,0.7) 30%, rgba(11,12,16,0.15) 70%, transparent 100%)' },
  full: { background: 'linear-gradient(180deg, rgba(11,12,16,0.82) 0%, rgba(11,12,16,0.3) 30%, rgba(11,12,16,0.4) 60%, rgba(11,12,16,0.92) 100%)' },
  top: { background: 'linear-gradient(to bottom, rgba(11,12,16,0.85) 0%, rgba(11,12,16,0.2) 60%, transparent 100%)' },
};

export function CinematicImage({
  src,
  cloudinaryId,
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

  /*
   Native <img> instead of next/image.
   next/image's fill + optimization pipeline was failing silently
   on Vercel (all cinematic images rendered as black/empty).
   Native img is reliable, zero-dependency, and these JPEGs are
   already production-optimized.
  */
  const resolvedSrc = cloudinaryId ? cloudinaryUrl(cloudinaryId, width || 1920) : (src || '');

  if (!resolvedSrc) return null;

  // Build responsive srcset for Cloudinary images
  const isCloudinary = resolvedSrc.includes('res.cloudinary.com');
  const srcSet = isCloudinary ? buildResponsiveSrcset(resolvedSrc) : undefined;

  // For mobile performance: use w_640 as the default src so mobile
  // browsers don't download the w_1920 variant. srcset handles larger screens.
  const mobileSrc = isCloudinary
    ? resolvedSrc.replace(/w_\d+/, 'w_640')
    : resolvedSrc;

  const imageEl = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={mobileSrc}
      srcSet={srcSet}
      sizes={fill ? '(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1400px' : undefined}
      alt={alt}
      width={width || (fill ? 1920 : undefined)}
      height={height || (fill ? 1080 : undefined)}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      draggable={false}
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
      className={fill ? 'cinematic-img-fill' : 'cinematic-img-sized'}
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
        background: 'linear-gradient(180deg, rgba(197,160,89,0.04) 0%, rgba(197,160,89,0.01) 40%, transparent 100%)',
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
        background: 'linear-gradient(to top, rgba(11,12,16,0.3) 0%, rgba(11,12,16,0.08) 40%, transparent 100%)',
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
      fill ? 'absolute inset-0' : 'relative',
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
