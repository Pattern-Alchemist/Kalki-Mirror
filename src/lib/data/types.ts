export type Tier = 'prithvi' | 'jal' | 'agni' | 'akash';

export type SiddhiLevel = 'Foundation' | 'Intermediate' | 'Advanced' | 'Restricted';

export type EvidenceConfidence = 'high' | 'medium' | 'low';

export interface EvidenceSource {
  confidence: EvidenceConfidence;
  title: string;
  url: string;
}

export type CautionLevel = 'OPEN' | 'MODERATE' | 'HIGH' | 'SEALED';

/** Map a SiddhiLevel to its corresponding CautionLevel for the archive gate. */
export function getCautionLevel(level: SiddhiLevel): CautionLevel {
  switch (level) {
    case 'Foundation': return 'OPEN';
    case 'Intermediate': return 'MODERATE';
    case 'Advanced': return 'HIGH';
    case 'Restricted': return 'SEALED';
  }
}

export interface Siddhi {
  slug: string;
  name: string;
  sanskrit: string;
  category: string;
  tradition: string;
  subcategory?: string;
  level: SiddhiLevel;
  durationHours: number;
  days: number;
  authenticityScore: number;
  summary: string;
  primaryMantra: string;
  lineage: string;
  benefits: string[];
  warnings: string[];
  evidenceCount: number;
  evidenceSources: EvidenceSource[];
  minTier: Tier;
  cautionLevel?: CautionLevel;
  archetypeId?: string;
  image?: string;
  // ── Scholarly provenance fields (v2) ──
  traditionalRef?: string;       // Primary textual source (e.g., "Haṭha Yoga Pradīpikā II.7-14", "Māṇḍūkya Upaniṣad vv.1-12")
  oralSource?: string;           // Oral lineage attribution (e.g., "Govinda Dās Āghori lineage, Varanasi")
  fieldNotes?: string;           // Fieldwork observations by Kaustubh or verified practitioners
  reconstructionNotes?: string;  // Notes on how the practice was reconstructed from fragmentary sources
  verbatimText?: string;         // Key original-language quotation (Sanskrit, with translation)
  disputedClaims?: string;       // What modern/new-age claims exist that are NOT supported by tradition
  practitionerCaveat?: string;   // Caveat for practitioners about what the practice can/cannot do
  contraindications?: string[];     // Medical/psychological contraindications
  integrations?: string[];         // What practices combine well with this one (siddhi slugs + notes)
  variantPractices?: { name: string; description: string; level: SiddhiLevel }[];
}

export interface Pattern {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  signs: string[];
  origin: string;
  practice: string;
  relatedSiddhis: string[];
  imageSlug: string;
  minTier?: Tier;
  archetypeIntegration?: string;  // Agni+ deep archetype mapping notes
  advancedNotes?: string;        // Akash+ advanced integration notes
}

export interface PricingTier {
  id: Tier;
  element: string;
  elementSanskrit: string;
  priceINR: number;
  priceUSD: number;
  annualDiscount: string;
  unlocks: string[];
  highlight: boolean;
  yearlyINR?: number;
  yearlyUSD?: number;
  features?: string[];
  gatedFeatures?: string[];
  sadhanaAccess?: 'basic' | 'standard' | 'advanced' | 'all';
  cta?: string;
  description?: string;
  popular?: boolean;
  elementEmoji?: string;
  color?: string;
}

export interface ConsultationService {
  slug: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  whatsappPrefill: string;
  popular: boolean;
}

export interface BreathPhase {
  name: string;
  duration: number;
}

export interface BreathPattern {
  slug: string;
  name: string;
  phases: BreathPhase[];
  cycles: number;
  minTier: Tier;
  description: string;
}

export interface Sadhana {
  slug: string;
  name: string;
  sanskrit: string;
  categoryId: string;          // Maps to TantraCategoryId
  tradition: string;
  level: SiddhiLevel;
  minTier: Tier;
  summary: string;
  duration: string;           // e.g. "40 days", "90 days", "Lifelong"
  dailyCommitment: string;     // e.g. "30 minutes", "2 hours"
  prerequisites: string[];
  steps: string[];
  primaryMantra?: string;
  materials?: string[];
  warnings?: string[];
  benefits?: string[];
  evidence?: 'TRADITIONAL' | 'ORAL' | 'FIELD' | 'RECONSTRUCTED';
  relatedCoursePhase?: string; // e.g. "Phase III", "Phase IV"
  relatedSiddhis?: string[];  // Siddhi slugs
}
