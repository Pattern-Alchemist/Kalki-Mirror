import type { Metadata } from "next";
import PrimerClient from "./PrimerClient";
import { PRIMER_PDF_PATH } from "@/lib/data/primer";

export const metadata: Metadata = {
  title: "The Seven Patterns — Free Primer (PDF) | AstroKalki",
  description:
    "Seven of the twenty emotional patterns of the KALKI corpus — the Rescuer, the Perfectionist, the Saboteur, the Martyr, the Judge, the Seeker, and the Void — each with its signs, its origin, and a first practice. Free PDF.",
  openGraph: {
    title: "The Seven Patterns — Free Primer | AstroKalki",
    description:
      "Seven of the twenty emotional patterns of the KALKI corpus, each with its signs, its origin, and a first practice. Free PDF field guide.",
    url: "https://www.astrokalki.com/primer",
    siteName: "AstroKalki — KALKI",
    type: "website",
  },
  alternates: { canonical: "/primer" },
  other: { "download-url": PRIMER_PDF_PATH },
};

export default function PrimerPage() {
  return <PrimerClient />;
}
