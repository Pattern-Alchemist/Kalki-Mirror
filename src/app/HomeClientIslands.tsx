'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';

const PricingCards = dynamic(() => import('@/components/monetization/PricingCards').then(m => ({ default: m.PricingCards })), { ssr: false });
const BreathTimer = dynamic(() => import('@/components/practice/BreathTimer').then(m => ({ default: m.BreathTimer })), { ssr: false });
const ResonanceToggle = dynamic(() => import('@/components/ui/ResonanceToggle').then(m => ({ default: m.ResonanceToggle })), { ssr: false });

/* ── Hero Background: video on desktop, static bg on mobile ── */
export function HeroBackground() {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <>
      {!isMobile ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          poster={`https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-temple-midnight`}
          className="hero-video-bg absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0, objectPosition: 'center' }}
        >
          <source src="https://res.cloudinary.com/b9oo5abp/video/upload/q_auto/kalki-mirror/hero-kalki-avatar-riding.mp4" type="video/mp4" />
        </video>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            zIndex: 0,
            backgroundImage: 'url(https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_640,c_limit/kalki-mirror/home/ancient-temple-midnight)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // @ts-expect-error fetchPriority is valid
            fetchPriority: 'high',
          }}
        />
      )}
    </>
  );
}

/* ── Hero text is now server-rendered in page.tsx for instant LCP ── */

/* ── Breath practice section ── */
export function BreathSection() {
  return (
    <>
      <div className="flex items-center gap-6 flex-wrap mb-12">
        <ResonanceToggle />
      </div>
      <BreathTimer patternSlug="nadi-shuddhi-basic" />
    </>
  );
}

/* ── Pricing section — CSS animation instead of framer-motion ── */
export function PricingSection() {
  return (
    <>
      <div className="text-center mb-20 pricing-section-entrance">
        <p className="section-label mb-6">Choose Your Depth</p>
        <h2 className="font-display text-4xl md:text-6xl text-white hero-heading tracking-[0.08em]">
          Four paths.{' '}
          <span style={{ display: 'block' }}>One purpose.</span>
        </h2>
      </div>
      <PricingCards />
    </>
  );
}

/* ── WhatsApp inline CTA ── */
export function WhatsAppInline() {
  return <WhatsAppCTA variant="inline" label="Consult Kaustubh" />;
}

/* ── Default export for convenience ── */
const HomeClientIslands = {
  HeroBackground,
  BreathSection,
  PricingSection,
  WhatsAppInline,
};

export default HomeClientIslands;
