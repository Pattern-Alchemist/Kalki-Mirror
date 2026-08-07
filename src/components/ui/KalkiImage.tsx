'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface KalkiImageProps {
  cloudinaryId?: string;
  src?: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlwfue8pg';

export function KalkiImage({
  cloudinaryId,
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1400px',
}: KalkiImageProps) {
  const [loaded, setLoaded] = useState(false);

  if (cloudinaryId) {
    const base = 'https://res.cloudinary.com/' + CLOUD + '/image/upload';
    const ar = width && height ? width / height : 16 / 9;
    const bps = [640, 768, 1024, 1280, 1536, 1920, 2560];
    const srcSet = bps
      .map((w) => base + '/f_auto,q_auto:good,w_' + w + ',h_' + Math.round(w / ar) + ',c_fill/' + cloudinaryId + ' ' + w + 'w')
      .join(', ');
    const blurUrl = base + '/f_auto,q_auto:low,w_40,c_fill/e_blur:1000/' + cloudinaryId;

    return (
      <div className={cn('relative overflow-hidden', fill && 'absolute inset-0', className)}>
        {!loaded && (
          <img
            src={blurUrl}
            alt=""
            aria-hidden="true"
            className={cn('absolute inset-0 w-full h-full object-cover', fill && 'absolute inset-0')}
            style={{ filter: 'blur(20px)', transform: 'scale(1.1)' }}
          />
        )}
        <img
          src={base + '/f_auto,q_auto:good,w_' + (width || 1920) + ',c_fill/' + cloudinaryId}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          draggable={false}
          onLoad={() => setLoaded(true)}
          className={cn(
            'transition-opacity duration-700',
            loaded ? 'opacity-100' : 'opacity-0',
            fill ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-full object-cover',
          )}
        />
      </div>
    );
  }

  if (!src) return null;
  return (
    <div className={cn('relative overflow-hidden', fill && 'absolute inset-0', className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        draggable={false}
        className={cn(
          'transition-opacity duration-500',
          fill ? 'absolute inset-0 w-full h-full object-cover' : 'w-full h-full object-cover',
        )}
      />
    </div>
  );
}
