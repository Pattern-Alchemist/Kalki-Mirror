import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Disclaimer — KALKI',
  description: 'The scope and limitations of KALKI\'s spiritual, astrological, and Tantric guidance on astrokalki.com.',
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer"
      description="The scope, limitations, and proper use of the spiritual, astrological, and Tantric guidance provided by KALKI."
      lastUpdated="2026-09-20"
      sections={[
        {
          id: 'educational-purpose',
          heading: '1. Educational & Spiritual Purpose',
          body: [
            'All content on astrokalki.com is provided for educational, spiritual, and reflective purposes. It is NOT a substitute for professional medical, psychological, legal, or financial advice.',
            'KALKI\'s approach synthesizes classical Vedic astrology, Tantric philosophy, and pattern recognition frameworks. These are interpretive disciplines rooted in centuries of tradition — they are not empirical sciences, and their accuracy cannot be guaranteed.',
            'The founder, Kaustubh Lokhande, is a practicing lineage-holder and Tantric Technologist. He is NOT a licensed medical professional, psychotherapist, financial advisor, or attorney. His consultations draw on traditional knowledge, not on credentials recognized by modern regulatory bodies.',
          ],
        },
        {
          id: 'no-guarantees',
          heading: '2. No Guarantees of Outcome',
          body: [
            'Vedic astrology and Tantric practice operate on the principle that karmic patterns influence but do not determine outcomes. We do not guarantee that:',
            '• A specific consultation will resolve your question or situation.',
            '• A prescribed sādhana (practice) will produce a specific result.',
            '• A planetary transit interpretation will accurately predict events.',
            '• Membership content will meet your specific spiritual or psychological needs.',
            'Spiritual growth is a co-creative process. The seeker\'s effort, intention, and receptivity matter as much as the guidance received. We provide the framework; you do the work.',
          ],
        },
        {
          id: 'not-medical',
          heading: '3. Not Medical or Psychological Advice',
          body: [
            'Our content and consultations may touch on themes of mental health, emotional patterns, and psychological shadow work. However:',
            '• We do NOT diagnose, treat, or cure any medical or psychological condition.',
            '• We do NOT prescribe medication or recommend discontinuing prescribed treatment.',
            '• If you are experiencing a mental health crisis (depression, anxiety, suicidal ideation), please contact a licensed mental health professional or a crisis helpline immediately:',
            '  - India: iCall (9152987821) or Vandrevala (1860-2662-345)',
            '  - US: 988 (Suicide & Crisis Lifeline)',
            '  - UK: 116-123 (Samaritans)',
            '  - International: findahelpline.com',
            'If you have a medical condition, consult a licensed physician before beginning any breathwork practice (especially kumbhaka / breath retention, which can affect blood pressure and cardiovascular health).',
          ],
        },
        {
          id: 'not-financial',
          heading: '4. Not Financial or Legal Advice',
          body: [
            'Vedic astrology includes the analysis of dhana (wealth) houses and planetary periods related to career and finance. However:',
            '• We do NOT provide investment advice, stock market predictions, or financial planning.',
            '• We do NOT recommend specific financial instruments, loans, or business decisions.',
            '• Any financial interpretation is for spiritual reflection only. Always consult a SEBI-registered investment advisor (India) or a licensed financial professional before making financial decisions.',
            'Similarly, we do NOT provide legal advice. For legal matters, consult a licensed attorney in your jurisdiction.',
          ],
        },
        {
          id: 'tantric-content',
          heading: '5. Tantric Content & Caution Levels',
          body: [
            'Our corpus includes content on Tantric practice, including sādhanas associated with the Mahāvidyā archetypes. Some of these practices carry traditional cautions:',
            '• OPEN: safe for general practitioners, no special preparation required.',
            '• MODERATE: requires foundational understanding; recommended for practitioners with an established sādhanā.',
            '• HIGH: powerful practices that can destabilize the unprepared; gated behind higher membership tiers for a reason. Not for casual exploration.',
            '• SEALED: traditional initiatory practices that require direct guru guidance. We describe them for scholarly understanding but do NOT provide the full method. Attempting them without initiation is at your own risk — and is, per traditional sources, spiritually counterproductive.',
            'If you have a history of psychosis, severe trauma, or psychiatric hospitalization, please consult a qualified mental health professional before engaging with any Tantric content. These practices can surface psychological material rapidly.',
          ],
        },
        {
          id: 'practice-tools',
          heading: '6. Practice Tools',
          body: [
            'The meditation timer, japa counter, and breathwork protocols are tools for personal spiritual practice. They are NOT medical devices and have not been evaluated by any regulatory authority.',
            '• Do NOT use the timer or breath protocols while driving, operating machinery, or in any situation where a lapse of attention could cause harm.',
            '• Breath retention (kumbhaka) should be approached gradually. If you feel dizzy, lightheaded, or experience chest pain, stop immediately and breathe normally.',
            '• The wake-lock feature (which prevents your screen from sleeping during a session) may drain your battery faster than expected.',
            '• Practice data (counts, streaks) is stored locally in your browser. Clearing your browser data will erase this. Use the export/import feature (when available) to back up your progress.',
          ],
        },
        {
          id: 'ai-archivist',
          heading: '7. The Archivist Chat (AI)',
          body: [
            'The Archivist is an AI assistant grounded in our site\'s corpus. It provides answers based on the content we have published. However:',
            '• AI responses are generated by language models and may contain errors, omissions, or misinterpretations.',
            '• The Archivist is designed to "refuse to improvise" — if the corpus is silent on a question, it says so. This is a feature, not a bug. When it says "the corpus is silent," treat that as an honest signal, not a failure.',
            '• Do NOT rely on AI responses for medical, legal, or financial decisions. Always cross-reference with the source content (the citation chips link to the underlying folio).',
            '• The Archivist does NOT have access to your personal data, birth chart, or consultation history. It is a general-purpose corpus Q&A tool, not a personal astrologer.',
            '• AI model providers (OpenRouter, the upstream model hosts) may log your questions for their own purposes. We do not control their data retention policies.',
          ],
        },
        {
          id: 'external-links',
          heading: '8. External Links & Third-Party Content',
          body: [
            'Our content may link to external sites (e.g. scholarly sources, traditional text repositories, WhatsApp). We are not responsible for the content or practices of these external sites. Their privacy policies and terms apply when you visit them.',
            'Some content references classical texts (Vedas, Tantras, Puranas) via translation. Translations vary; we use the translations we find most reliable but cannot guarantee their absolute accuracy. Where a Sanskrit term is ambiguous, we note the alternative readings.',
          ],
        },
        {
          id: 'acceptance',
          heading: '9. Acceptance of This Disclaimer',
          body: [
            'By using astrokalki.com and our services, you acknowledge that you have read, understood, and agree to this Disclaimer. You accept that:',
            '• You are responsible for your own decisions, actions, and well-being.',
            '• You will not hold KALKI, its founder, or its contributors liable for any outcome — positive or negative — arising from the use of our content or services.',
            '• You will exercise discernment and consult appropriate professionals (medical, legal, financial) when the situation warrants.',
            'If you do not agree with this Disclaimer, please do not use the Site.',
          ],
        },
        {
          id: 'contact',
          heading: '10. Contact',
          body: [
            'For questions about this Disclaimer, contact:',
            'Email: legal@astrokalki.com',
            'WhatsApp: +91 89208 62931',
          ],
        },
      ]}
    />
  );
}
