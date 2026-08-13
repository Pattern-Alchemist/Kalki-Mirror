import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Sādhanā Library — Thirty Practice Protocols Across Thirteen Categories',
  description:
    'Structured practice protocols from living lineages — Mantra, Yantra, Nyāsa, Pūjā, Dhāraṇā, Prāṇāyāma, Dhyāna, Dhūni, Śmāśana, Bhasma, Japa, Kuṇḍalinī, Sevā. Evidence-graded. Step-by-step.',
  openGraph: {
    title: 'The Sādhanā Library | KALKI',
    description:
      'Structured practice protocols from living lineages. Thirteen categories. Evidence-graded. Step-by-step.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/forgotten-chamber',
        width: 1920,
        alt: 'The Sādhanā Library — KALKI',
      },
    ],
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
