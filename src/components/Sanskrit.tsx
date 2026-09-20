// =============================================================
// AUDIT2 #26 — Sanskrit text component
// -------------------------------------------------------------
// Wraps Sanskrit text (Devanāgarī or IAST) with lang="sa" so screen
// readers pronounce it with Sanskrit phonetics instead of English.
// Drop-in replacement: <Skt>{sanskritText}</Skt> instead of {sanskritText}
// =============================================================

import React from 'react';

interface SktProps {
  children: React.ReactNode;
  className?: string;
}

export function Skt({ children, className }: SktProps) {
  return (
    <span lang="sa" className={className}>
      {children}
    </span>
  );
}

/**
 * Detect whether a string contains Devanāgarī characters.
 * Used to conditionally apply lang="sa" only when the text is actually
 * in Devanāgarī (not for IAST transliteration, which is Latin).
 */
export function isDevanagari(text: string): boolean {
  // Unicode range for Devanāgarī: U+0900–U+097F
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Conditionally wrap text with lang="sa" ONLY if it contains Devanāgarī.
 * IAST text (ṃ, ā, ś, ṛ, ṣ) is Latin script and doesn't need lang="sa".
 */
export function LangAware({ children, className }: SktProps) {
  if (typeof children === 'string' && isDevanagari(children)) {
    return <span lang="sa" className={className}>{children}</span>;
  }
  return <span className={className}>{children}</span>;
}
