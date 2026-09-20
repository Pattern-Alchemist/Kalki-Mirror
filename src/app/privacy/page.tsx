import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — KALKI',
  description: 'How KALKI (astrokalki.com) collects, uses, and protects your data. Compliant with India DPDP Act 2023, GDPR, and CCPA.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How KALKI collects, uses, and protects your data. This policy applies to astrokalki.com and covers all services we provide."
      lastUpdated="2026-09-20"
      sections={[
        {
          id: 'overview',
          heading: '1. Overview',
          body: [
            'KALKI ("we", "us", "our") operates astrokalki.com (the "Site"). We provide Vedic astrology consultations, educational content on Tantric practice, and membership-based access to a curated corpus of spiritual texts.',
            'This Privacy Policy explains what data we collect, why we collect it, how we use it, and the rights you have over your data. We are committed to compliance with India\'s Digital Personal Data Protection (DPDP) Act 2023, the European Union\'s General Data Protection Regulation (GDPR), and the California Consumer Privacy Act (CCPA).',
            'By using the Site, you consent to the practices described in this policy. If you do not agree with these practices, please do not use the Site.',
          ],
        },
        {
          id: 'data-we-collect',
          heading: '2. Data We Collect',
          body: [
            'We collect only the data necessary to provide our services:',
            '• Account data: your email address (for magic-link authentication), name (optional), and tier status (Prithvi, Jal, Agni, Akash).',
            '• Consultation intake data: your name, email, phone number (for WhatsApp coordination), birth details (date, time, place), and the question or context you share. This is provided voluntarily when you request a consultation.',
            '• Payment metadata: for membership purchases, we store the UPI transaction reference (UTR) and payment status. We do NOT store full payment credentials — payments are processed via UPI directly between you and our bank, or via third-party payment gateways (Razorpay/Stripe) whose privacy policies apply to the transaction itself.',
            '• Analytics data: we run a first-party analytics system (no Google Analytics, no Meta Pixel). We collect page views, session IDs (random UUIDs stored in sessionStorage, not cookies), event types (e.g. "folio_viewed", "pricing_viewed"), and approximate geographic region (country-level, via Vercel\'s edge header — not precise IP). IPs are never stored in our database.',
            '• Attribution data: if you arrive via a campaign link (?key=...), we record which Golden Key redeemed your consultation for campaign analytics.',
            '• Practice data: if you use the meditation timer or japa counter, your session counts and streaks are stored in your browser\'s local storage or IndexedDB — this data never leaves your device unless you explicitly export and share it.',
          ],
        },
        {
          id: 'how-we-use-data',
          heading: '3. How We Use Your Data',
          body: [
            'We use your data only to:',
            '• Provide the services you requested (consultations, membership access, email course delivery).',
            '• Communicate with you about your consultation, membership, or course progress.',
            '• Send the weekly digest and broadcast letters (if you have subscribed — you can unsubscribe at any time).',
            '• Improve our content and services (via aggregated, anonymized analytics — never individual tracking for advertising).',
            '• Detect and prevent abuse, fraud, and unauthorized access.',
            'We do NOT:',
            '• Sell your data to third parties. Ever.',
            '• Use your data for targeted advertising. We run zero third-party ad scripts.',
            '• Share your data with social media platforms, data brokers, or analytics networks.',
            '• Profile you for behavioral advertising.',
          ],
        },
        {
          id: 'legal-basis',
          heading: '4. Legal Basis (GDPR)',
          body: [
            'For users in the European Economic Area, we process your personal data on the following legal bases:',
            '• Consent: when you provide your email for the newsletter or email course, you consent to receiving those communications. You can withdraw consent at any time via the unsubscribe link in every email.',
            '• Contract: when you purchase a membership or consultation, we process your data to fulfill that contract.',
            '• Legitimate interest: we process anonymous analytics data to improve our services, balancing our interest against your privacy rights.',
          ],
        },
        {
          id: 'data-retention',
          heading: '5. Data Retention',
          body: [
            'We retain your data only as long as necessary:',
            '• Active member accounts: retained while your membership is active + 30 days after cancellation (to allow reinstatement).',
            '• Consultation records: retained for 7 years (the statute of limitations for service disputes under Indian law).',
            '• Email subscriber data: retained until you unsubscribe + 30 days (to handle any delayed bounces).',
            '• Analytics events: aggregated for 90 days, then automatically purged.',
            '• Practice data (browser-side): retained in your browser until you clear local storage or use the in-app "reset" function.',
          ],
        },
        {
          id: 'your-rights',
          heading: '6. Your Rights',
          body: [
            'You have the following rights over your data:',
            '• Right to access: request a copy of all data we hold about you.',
            '• Right to rectification: correct inaccurate or incomplete data.',
            '• Right to erasure ("right to be forgotten"): request deletion of your data (subject to legal retention requirements).',
            '• Right to data portability: receive your data in a machine-readable format (JSON).',
            '• Right to object: object to processing based on legitimate interest.',
            '• Right to withdraw consent: at any time, for consent-based processing.',
            'To exercise any of these rights, email privacy@astrokalki.com. We respond within 30 days.',
          ],
        },
        {
          id: 'cookies',
          heading: '7. Cookies & Tracking',
          body: [
            'We use minimal cookies:',
            '• kalki_sid: a session ID stored in sessionStorage (cleared when you close your browser). Used only for analytics grouping.',
            '• kr_country: your approximate country (ISO-3166 alpha-2) for content localization. Set by our edge middleware, no Secure/HttpOnly flag (readable by client for UI localization).',
            '• kalki-exp-*: A/B test variant assignment (30-day expiry). Used only to ensure you see the same variant on repeat visits.',
            '• kalki-admin-lang: your preferred admin language (en/hi). Admin-only.',
            'We do NOT use:',
            '• Third-party analytics cookies (no Google Analytics, no Meta Pixel, no Hotjar).',
            '• Advertising cookies (no Google Ads, no Meta Ads).',
            '• Cross-site tracking cookies.',
          ],
        },
        {
          id: 'third-party',
          heading: '8. Third-Party Services',
          body: [
            'We use the following third-party services. Each has its own privacy policy:',
            '• Vercel: hosting and edge delivery. Vercel processes IP addresses for DDoS protection but does not share them with us.',
            '• Cloudinary: image hosting and transformation. Images are served from Cloudinary\'s CDN; no personal data is sent to Cloudinary.',
            '• Turso (libSQL): our database provider. All data is stored in Turso\'s AWS ap-south-1 (Mumbai) region.',
            '• Resend: transactional email delivery (consultation confirmations, weekly digest). Resend sees your email address but not your consultation content.',
            '• OpenRouter: AI model provider for the Archivist chat. Your chat questions are sent to OpenRouter for processing; we do not store the AI\'s response beyond the current session.',
            '• WhatsApp: consultation coordination. When you click a WhatsApp deep-link, WhatsApp\'s privacy policy applies to the conversation.',
          ],
        },
        {
          id: 'security',
          heading: '9. Security',
          body: [
            'We take reasonable measures to protect your data:',
            '• All data in transit is encrypted via TLS 1.3 (HTTPS).',
            '• Passwords are hashed using bcrypt (never stored in plaintext).',
            '• Two-factor authentication (TOTP) is enforced for all admin accounts.',
            '• The database is backed up daily with 30-day retention.',
            '• IP allowlisting is available for admin access.',
            '• No payment card data is ever stored on our servers.',
            'However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security, but we commit to notifying you within 72 hours of any data breach affecting your personal data, as required by GDPR Article 33.',
          ],
        },
        {
          id: 'children',
          heading: '10. Children\'s Privacy',
          body: [
            'Our services are not directed to children under 18. We do not knowingly collect personal data from anyone under 18. If you believe we have collected data from a minor, please contact privacy@astrokalki.com and we will delete it immediately.',
            'Vedic astrology consultations require the maturity to engage with karmic patterns, psychological shadow work, and Tantric practice frameworks. Minors should not use these services without parental guidance.',
          ],
        },
        {
          id: 'changes',
          heading: '11. Changes to This Policy',
          body: [
            'We may update this Privacy Policy from time to time. We will notify you of material changes by:',
            '• Posting a prominent notice on the homepage for 30 days.',
            '• Sending an email to active subscribers.',
            '• Updating the "Last updated" date at the top of this page.',
            'Continued use of the Site after changes take effect constitutes acceptance of the updated policy.',
          ],
        },
        {
          id: 'contact',
          heading: '12. Contact',
          body: [
            'For privacy questions, data requests, or to exercise any right listed above, contact:',
            'Kaustubh Lokhande',
            'Email: privacy@astrokalki.com',
            'WhatsApp: +91 89208 62931',
            'For DPDP Act complaints: Data Protection Board of India.',
            'For GDPR complaints: your local Data Protection Authority (e.g. Ireland\'s DPC for EU residents).',
            'For CCPA complaints: California Attorney General\'s office.',
          ],
        },
      ]}
    />
  );
}
