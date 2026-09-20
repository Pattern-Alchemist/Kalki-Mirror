import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — KALKI',
  description: 'The terms governing your use of astrokalki.com — membership, consultations, content licensing, and acceptable use.',
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms and conditions governing your use of astrokalki.com and the services provided by KALKI."
      lastUpdated="2026-09-20"
      sections={[
        {
          id: 'acceptance',
          heading: '1. Acceptance of Terms',
          body: [
            'By accessing or using astrokalki.com (the "Site"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Site.',
            'These Terms constitute a legally binding agreement between you ("User", "you") and KALKI ("we", "us", "our").',
          ],
        },
        {
          id: 'services',
          heading: '2. Description of Services',
          body: [
            'KALKI provides the following services:',
            '• Free access to a curated corpus of Vedic astrology, Tantra, and spiritual practice content (glossary, patterns, archetypes, breathwork protocols).',
            '• Membership tiers (Prithvi, Jal, Agni, Akash) granting access to deeper content layers, practice sequences, and the Aghorī Tantra course.',
            '• Paid 1:1 consultations with the founder (Kaustubh Lokhande) via WhatsApp or scheduled call.',
            '• An AI-powered "Archivist" chat that answers questions grounded in the site\'s corpus.',
            '• Practice tools (meditation timer, japa counter, breath pacer) for personal spiritual use.',
            'We reserve the right to modify, suspend, or discontinue any service at any time without notice. We will not be liable to you for any such modification, suspension, or discontinuance.',
          ],
        },
        {
          id: 'membership',
          heading: '3. Membership Tiers & Access',
          body: [
            'Membership is granted via Golden Keys (invite codes) or direct purchase:',
            '• Prithvi (free): access to public content, glossary, patterns, and the 10 Doors email course.',
            '• Jal: access to breathwork protocols, practice sequences, and the folio corpus (OPEN + MODERATE caution).',
            '• Agni: access to advanced sādhana content, archetype deep-dives, and the Aghorī Tantra course (first 4 phases).',
            '• Akash: full access including SEALED-tier content, personal guidance, and all 8 Aghorī phases.',
            'Membership is non-transferable. You may not share your account credentials or Golden Keys with others. Each key has a maximum use count; exceeding it voids the key.',
            'We reserve the right to revoke access for abuse, including: sharing credentials, scraping content for redistribution, or using the services for commercial gain without authorization.',
          ],
        },
        {
          id: 'consultations',
          heading: '4. Consultations',
          body: [
            'Paid consultations are 1:1 sessions with the founder. When you book a consultation:',
            '• You provide birth data (date, time, place), your question or context, and contact details.',
            '• The consultation is delivered via WhatsApp or a scheduled call, as mutually agreed.',
            '• The consultation fee is payable in advance via UPI (domestic) or the payment link provided (international).',
            '• Consultations are personal to you. You may not record, redistribute, or publish the consultation without explicit written consent.',
            '• The founder is not a licensed medical professional, psychotherapist, or financial advisor. Consultations are for spiritual and educational purposes. See our Disclaimer for full scope.',
          ],
        },
        {
          id: 'content-license',
          heading: '5. Content License',
          body: [
            'All content on astrokalki.com is owned by KALKI and protected by copyright law. This includes:',
            '• Text content (glossary entries, pattern descriptions, archetype analyses, letters, course materials).',
            '• Images, yantra designs, and visual assets.',
            '• Software (the Site itself, practice tools, the Archivist chat).',
            'We grant you a limited, non-exclusive, non-transferable license to:',
            '• Access and read the content for personal, non-commercial use.',
            '• Use the practice tools for your personal spiritual practice.',
            '• Quote brief excerpts (under 100 words) with attribution to astrokalki.com.',
            'You may NOT:',
            '• Reproduce, republish, or redistribute substantial portions of the content.',
            '• Use the content for commercial purposes (including: paid courses, books, apps) without a separate commercial license.',
            '• Scrape, crawl, or systematically extract the content (the /llms.txt file permits specific AI crawlers for indexing, not for training commercial models).',
            '• Remove or alter copyright notices.',
          ],
        },
        {
          id: 'acceptable-use',
          heading: '6. Acceptable Use',
          body: [
            'You agree NOT to:',
            '• Use the Site for any unlawful purpose.',
            '• Attempt to gain unauthorized access to our systems, accounts, or data.',
            '• Interfere with the proper functioning of the Site (DDoS, bot abuse, rate-limit evasion).',
            '• Use the Archivist chat to generate content for redistribution as your own.',
            '• Submit consultation requests that are fraudulent, abusive, or contain illegal content.',
            '• Impersonate another person or entity.',
            '• Use the practice tools in situations where doing so creates a safety risk (e.g. driving, operating machinery).',
            'Violations may result in immediate account termination and a permanent ban.',
          ],
        },
        {
          id: 'payment',
          heading: '7. Payment & Billing',
          body: [
            'Membership and consultation fees are payable in advance:',
            '• Domestic (India): UPI to 8920862931@ibl. After payment, submit the UTR reference via the membership request form for reconciliation.',
            '• International: via the payment link provided (Razorpay/Stripe). The gateway\'s terms apply to the transaction.',
            '• All fees are in INR unless otherwise stated. International fees are converted at the prevailing rate.',
            '• Membership auto-renews only if you explicitly re-subscribe. We do NOT auto-charge.',
            'See our Refund Policy for cancellation and refund terms.',
          ],
        },
        {
          id: 'disclaimer',
          heading: '8. Disclaimer of Warranties',
          body: [
            'The Site and services are provided "as is" without warranties of any kind. We do not warrant that:',
            '• The Site will be uninterrupted, error-free, or secure.',
            '• The content is accurate, complete, or current (Vedic astrology is interpretive, not empirical).',
            '• Consultations will produce specific outcomes (karmic patterns are not deterministic).',
            '• The practice tools are suitable for your specific physical or mental health needs.',
            'See our Disclaimer page for the full scope of our liability limitations.',
          ],
        },
        {
          id: 'liability',
          heading: '9. Limitation of Liability',
          body: [
            'To the maximum extent permitted by law, KALKI shall not be liable for:',
            '• Indirect, incidental, special, consequential, or punitive damages.',
            '• Loss of profits, data, or goodwill.',
            '• Any damages arising from your use of or inability to use the Site.',
            'Our total liability for any claim arising from these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.',
            'This limitation applies even if we have been advised of the possibility of such damages.',
          ],
        },
        {
          id: 'governing-law',
          heading: '10. Governing Law & Dispute Resolution',
          body: [
            'These Terms are governed by the laws of India. Any dispute arising shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India.',
            'Before initiating litigation, we encourage you to contact us at legal@astrokalki.com to attempt informal resolution. We commit to responding within 7 days.',
          ],
        },
        {
          id: 'changes',
          heading: '11. Changes to Terms',
          body: [
            'We may update these Terms from time to time. We will notify you of material changes by:',
            '• Posting a prominent notice on the homepage for 30 days.',
            '• Sending an email to active members.',
            '• Updating the "Last updated" date at the top of this page.',
            'Continued use of the Site after changes take effect constitutes acceptance of the updated Terms.',
          ],
        },
        {
          id: 'contact',
          heading: '12. Contact',
          body: [
            'For questions about these Terms, contact:',
            'Kaustubh Lokhande',
            'Email: legal@astrokalki.com',
            'WhatsApp: +91 89208 62931',
          ],
        },
      ]}
    />
  );
}
