'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';

const PricingCards = dynamic(() => import('@/components/monetization/PricingCards').then(m => ({ default: m.PricingCards })), { ssr: false });
const BreathTimer = dynamic(() => import('@/components/practice/BreathTimer').then(m => ({ default: m.BreathTimer })), { ssr: false });
const ResonanceToggle = dynamic(() => import('@/components/ui/ResonanceToggle').then(m => ({ default: m.ResonanceToggle })), { ssr: false });

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

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

/* ── Hero text with entrance animation ── */
export function HeroText() {
  const reduced = useNativeReducedMotion();

  return (
    <>
      <motion.div
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      >
        <div className="hero-glow-container relative inline-block">
          <h1 className="hero-glow-text font-display text-white hero-heading tracking-[0.08em] uppercase"
            style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', lineHeight: 1 }}
          >
            KALKI
          </h1>
        </div>
        <p className="font-ui text-base md:text-lg tracking-[0.35em] uppercase mt-4 mb-10"
          style={{
            color: 'var(--gold-label)',
            textShadow: '0 2px 18px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.15)',
          }}
        >
          Tantrik Intelligence
        </p>
      </motion.div>

      <motion.div
        className="hero-actions flex flex-wrap gap-4 mt-4"
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link href="/archive" className="gold-cta">Akashic</Link>
        <Link href="/practice" className="ghost-cta">Tantra</Link>
      </motion.div>
    </>
  );
}

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

/* ── Pricing section with animation ── */
export function PricingSection() {
  const reduced = useNativeReducedMotion();

  return (
    <>
      <motion.div
        className="text-center mb-20"
        initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
        whileInView={fadeInUp.visible}
        viewport={{ once: true }}
      >
        <p className="section-label mb-6">Choose Your Depth</p>
        <h2 className="font-display text-4xl md:text-6xl text-white hero-heading tracking-[0.08em]">
          Four paths.{' '}
          <span style={{ display: 'block' }}>One purpose.</span>
        </h2>
      </motion.div>
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
  HeroText,
  BreathSection,
  PricingSection,
  WhatsAppInline,
};

export default HomeClientIslands;
