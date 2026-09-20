import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Refund Policy — KALKI',
  description: 'Cancellation and refund terms for KALKI memberships and consultations on astrokalki.com.',
  robots: { index: true, follow: true },
};

export default function RefundPage() {
  return (
    <LegalPage
      title="Refund Policy"
      description="Our policy for cancellations and refunds on memberships and consultations. We aim to be fair and transparent."
      lastUpdated="2026-09-20"
      sections={[
        {
          id: 'overview',
          heading: '1. Overview',
          body: [
            'We want you to be confident in your purchase. This policy explains when and how we issue refunds for KALKI memberships and consultations.',
            'Because our services are primarily digital (access to content, courses, and AI tools) and consultations are time-based (the founder\'s time is reserved for you), the refund windows differ by service type.',
          ],
        },
        {
          id: 'memberships',
          heading: '2. Membership Refunds',
          body: [
            'Membership purchases (Jal, Agni, Akash tiers) are eligible for a full refund within 7 days of purchase, provided:',
            '• You have not accessed more than 3 gated content pages (we track access via the audit log).',
            '• You have not used the Archivist chat more than 5 times.',
            '• You have not downloaded or exported gated content.',
            'To request a refund, email refunds@astrokalki.com with your email + the UTR/payment reference within 7 days. We process refunds within 5 business days.',
            'After the 7-day window, memberships are non-refundable. However, you can cancel auto-renewal at any time (we do NOT auto-charge — you must explicitly re-subscribe).',
            'If we terminate your account for violation of our Terms of Service, no refund is issued.',
          ],
        },
        {
          id: 'consultations',
          heading: '3. Consultation Refunds',
          body: [
            'Consultations are time-based services. The founder reserves a specific time slot for you. Refund terms:',
            '• Cancellation more than 24 hours before the scheduled time: full refund.',
            '• Cancellation less than 24 hours before: 50% refund (the time slot cannot be re-filled).',
            '• No-show (you do not join the call or respond on WhatsApp within 15 minutes of the scheduled time): no refund.',
            '• If the founder cancels or reschedules: full refund OR a rescheduled session at your convenience, your choice.',
            '• If you are dissatisfied with the consultation: contact us within 48 hours. We will review the recording/transcript and, at our discretion, offer a partial refund (up to 50%) or a follow-up session at no cost. Spiritual guidance is interpretive — we cannot guarantee specific outcomes.',
          ],
        },
        {
          id: 'golden-keys',
          heading: '4. Golden Keys & Campaign Codes',
          body: [
            'Golden Keys are not purchases — they are invitations. If you redeemed a key and the access did not activate:',
            '• Contact support@astrokalki.com with the key code + your email.',
            '• We will investigate and, if the key was valid and un-used, re-activate it.',
            'Keys that have been revoked (due to abuse, expiration, or campaign end) are not eligible for re-activation.',
          ],
        },
        {
          id: 'process',
          heading: '5. Refund Process',
          body: [
            'To request a refund:',
            '1. Email refunds@astrokalki.com with your name, email, and the UTR/payment reference.',
            '2. State the reason for the refund request.',
            '3. We review within 2 business days and respond with a decision.',
            '4. If approved, we process the refund to the original payment method within 5 business days (UPI) or 10 business days (international gateway).',
            'Refunds are issued to the original payment method only. We do not issue refunds to alternate accounts.',
          ],
        },
        {
          id: 'exceptions',
          heading: '6. Exceptions',
          body: [
            'Refunds are NOT issued in the following cases:',
            '• You have violated the Terms of Service (abuse, scraping, credential sharing).',
            '• You have already accessed substantial gated content (more than 3 pages or 5 chat queries).',
            '• The 7-day window (memberships) or 48-hour window (consultations) has passed.',
            '• The consultation was a no-show.',
            '• The refund request is fraudulent (claiming non-receipt when access logs show usage).',
          ],
        },
        {
          id: 'chargebacks',
          heading: '7. Chargebacks',
          body: [
            'If you initiate a chargeback with your bank without first contacting us, we will:',
            '• Suspend your account pending resolution.',
            '• Provide the bank with access logs, audit trails, and this refund policy.',
            '• Counter-dispute the chargeback if we believe it is fraudulent.',
            'Please contact us first — we are reasonable and aim to resolve disputes without bank intervention.',
          ],
        },
        {
          id: 'contact',
          heading: '8. Contact',
          body: [
            'For refund questions, contact:',
            'Email: refunds@astrokalki.com',
            'WhatsApp: +91 89208 62931',
            'We respond to all refund requests within 2 business days.',
          ],
        },
      ]}
    />
  );
}
