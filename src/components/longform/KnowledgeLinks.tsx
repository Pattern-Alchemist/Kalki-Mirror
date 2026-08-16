'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';

interface KnowledgeLink {
  href: string;
  label: string;
  description: string;
  type: 'siddhi' | 'pattern' | 'practice' | 'method' | 'research';
}

interface KnowledgeLinksProps {
  title?: string;
  links: KnowledgeLink[];
}

const TYPE_STYLES: Record<string, { label: string; color: string }> = {
  siddhi:   { label: 'Akasha',     color: 'text-gold' },
  pattern:  { label: 'Pattern',     color: 'text-purple-400' },
  practice: { label: 'Sādhana',    color: 'text-cyan-400' },
  method:   { label: 'The Method',      color: 'text-gold-dim' },
  research: { label: 'Sources',    color: 'text-text-muted' },
};

export function KnowledgeLinks({ title = 'What should you explore next?', links }: KnowledgeLinksProps) {
  const reduced = useNativeReducedMotion();
  return (
    <motion.section
      className="mt-24 pt-16 border-t border-gold-subtle"
      initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
      whileInView={staggerContainer.visible}
      viewport={{ once: true, margin: '-80px' }}
    >
      <p className="section-label mb-4">Continue Learning</p>
      <h2 className="font-display text-3xl md:text-4xl mb-12">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {links.map((link) => {
          const style = TYPE_STYLES[link.type] ?? TYPE_STYLES.research;
          return (
            <motion.div key={link.href} variants={staggerItem}>
              <Link
                href={link.href}
                className="glass-chip p-6 block hover:border-gold transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-ui tracking-wider uppercase ${style.color}`}>
                    {style.label}
                  </span>
                </div>
                <h3 className="font-display text-lg text-foreground group-hover:text-gold transition-colors mb-2">
                  {link.label}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">{link.description}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}