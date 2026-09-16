'use client';

import { useEffect } from 'react';

// =============================================================
// KALKI — Tawk.to integration (the quick lead-capture win)
// -------------------------------------------------------------
// Loads the Tawk.to widget script ONLY when the env var
// NEXT_PUBLIC_TAWK_PROPERTY_ID is set. Until then, this component
// is a no-op — zero impact on the page.
//
// The founder creates a free Tawk.to account, gets a Property ID,
// and adds it to Vercel env as NEXT_PUBLIC_TAWK_PROPERTY_ID
// (format: "property_id/widget_id"). The widget appears instantly.
//
// The custom KalkiChatWidget is always present (it's the primary
// AI surface). Tawk.to is the secondary "talk to a human" widget.
// =============================================================

export function TawkToScript() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;

  useEffect(() => {
    if (!propertyId) return;

    // propertyId format: "abc123456/wxy789" (property_id/widget_id)
    const [prop, widget] = propertyId.split('/');
    if (!prop || !widget) return;

    // Load the Tawk.to script
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://embed.tawk.to/${prop}/${widget}`;
    s.charset = 'UTF-8';
    s.setAttribute('crossorigin', '*');
    document.head.appendChild(s);

    return () => {
      // Clean up on unmount (mainly for dev HMR)
      try {
        document.head.removeChild(s);
      } catch {
        // already removed
      }
    };
  }, [propertyId]);

  // No render output — Tawk.to manages its own DOM
  return null;
}
