'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function ResonanceToggle() {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; osc1: OscillatorNode; osc2: OscillatorNode; lfo: OscillatorNode; lfoGain: GainNode } | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const startAudio = useCallback(() => {
    if (nodesRef.current) return;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 2);
    gain.connect(ctx.destination);
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, ctx.currentTime);
    osc1.connect(gain);
    osc1.start();
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(162, ctx.currentTime);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.03, ctx.currentTime);
    osc2.connect(gain2);
    gain2.connect(gain);
    osc2.start();
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.015, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    nodesRef.current = { gain, osc1, osc2, lfo, lfoGain };
  }, []);

  const stopAudio = useCallback(() => {
    if (!nodesRef.current || !audioCtxRef.current) return;
    const { gain, osc1, osc2, lfo } = nodesRef.current;
    const ctx = audioCtxRef.current;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    setTimeout(() => {
      osc1.stop();
      osc2.stop();
      lfo.stop();
      ctx.close();
      nodesRef.current = null;
      audioCtxRef.current = null;
    }, 1600);
  }, []);

  const toggle = useCallback(() => {
    if (active) { stopAudio(); } else { startAudio(); }
    setActive(!active);
  }, [active, startAudio, stopAudio]);

  useEffect(() => {
    return () => { if (nodesRef.current) { try { stopAudio(); } catch { /* */ } } };
  }, [stopAudio]);

  if (!visible) return null;

  const trackClass = active
    ? 'relative inline-flex w-10 h-5 rounded-full bg-gold/20 border border-gold/40 transition-colors duration-700'
    : 'relative inline-flex w-10 h-5 rounded-full bg-surface border border-gold/10 transition-colors duration-700';

  const knobClass = active
    ? 'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-gold transition-colors duration-700 left-[22px]'
    : 'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-copper transition-colors duration-700 left-0.5';

  return (
    <motion.button
      className="flex items-center gap-3 group"
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      onClick={toggle}
      aria-label={active ? 'Deactivate resonance' : 'Activate resonance'}
      aria-pressed={active}
    >
      <span className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {active ? 'Deactivate' : 'Activate'} Resonance
      </span>

      <span className={trackClass}>
        <span className="absolute inset-0 flex items-center px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gold/20" />
          <span className="flex-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold/20" />
        </span>
        <motion.span
          className={knobClass}
          layout={reduced ? false : true}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
    </motion.button>
  );
}
