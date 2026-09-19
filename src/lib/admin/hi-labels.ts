// =============================================================
// VOL. 2 #19 — Hindi admin labels dictionary
// -------------------------------------------------------------
// Static dictionary for the admin UI's chrome (sidebar nav,
// topbar HUD, section headers). User content (member names,
// consultation requests, etc.) stays as-is — only labels are
// translated. The dictionary is intentionally small (~60 entries)
// — it covers the visible chrome only, not full page content.
// =============================================================

export const HI_ADMIN_LABELS: Record<string, string> = {
  // Sidebar sections
  'Command': 'आदेश',
  'People': 'जन',
  'Craft': 'शिल्प',
  'System': 'तंत्र',

  // Sidebar nav items
  'Overview': 'अवलोकन',
  'War Room': 'युद्ध कक्ष',
  'Consultations': 'परामर्श',
  'Members': 'सदस्य',
  'Memberships': 'सदस्यता',
  'Subscribers': 'सदस्य (ईमेल)',
  'Golden Keys': 'स्वर्ण कुंजी',
  'Content Studio': 'सामग्री स्थल',
  'Folio Corpus': 'फोलियो संग्रह',
  'Broadcast': 'प्रसारण',
  'Testimonials': 'प्रशंसा',
  'Analytics': 'विश्लेषण',
  'Audit Log': 'लेखा अभिलेख',
  'Settings': 'सेटिंग्स',

  // Topbar HUD
  'pending': 'लंबित',
  'Search or jump…': 'खोजें या जाएँ…',

  // Common buttons
  'Refresh': 'ताज़ा करें',
  'Save': 'सहेजें',
  'Cancel': 'रद्द करें',
  'Delete': 'हटाएँ',
  'Approve': 'स्वीकृत करें',
  'Hide': 'छिपाएँ',
  'Export': 'निर्यात',
  'Import': 'आयात',

  // Page headers
  'Archivist Overview': 'अभिलेखक अवलोकन',
  'First-Party Analytics': 'प्रथम-पक्ष विश्लेषण',
  'Backups & Restore': 'बैकअप एवं पुनर्स्थापना',
  'Email Templates': 'ईमेल टेम्पलेट',
  'A/B Experiments': 'ए/बी प्रयोग',
  'Core Web Vitals': 'कोर वेब वाइटल्स',
  'SEO Dashboard': 'एसईओ डैशबोर्ड',
  'Campaign Analytics': 'अभियान विश्लेषण',
  'Folio Corpus Visualizer': 'फोलियो दृश्यकर्ता',

  // Settings sections
  'Current Session': 'वर्तमान सत्र',
  'Email': 'ईमेल',
  'Name': 'नाम',
  'Role': 'भूमिका',
  'Tier': 'स्तर',
  'Environment Variables': 'पर्यावरण चर',
  'Database Summary': 'डेटाबेस सारांश',

  // Statuses
  'DRAFT': 'प्रारूप',
  'RUNNING': 'चल रहा',
  'PAUSED': 'विरामित',
  'COMPLETED': 'पूर्ण',
  'PENDING': 'लंबित',
  'APPROVED': 'स्वीकृत',
  'HIDDEN': 'छिपा हुआ',
  'NEW': 'नया',
  'ACKNOWLEDGED': 'स्वीकृत',
  'SCHEDULED': 'निर्धारित',
  'CANCELLED': 'रद्द',
} as const;

/**
 * Translate a label to Hindi. Falls back to the original English
 * string if no translation exists (the founder's content stays
 * readable — only chrome is translated).
 */
export function hi(label: string): string {
  return HI_ADMIN_LABELS[label] ?? label;
}
