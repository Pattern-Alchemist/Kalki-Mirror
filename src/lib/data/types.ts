export type Tier = 'prithvi' | 'jal' | 'agni' | 'akash';

export type SiddhiLevel = 'Foundation' | 'Intermediate' | 'Advanced' | 'Restricted';

export type EvidenceConfidence = 'high' | 'medium' | 'low';

export interface EvidenceSource {
  confidence: EvidenceConfidence;
  title: string;
  url: string;
}

export interface Siddhi {
  slug: string;
  name: string;
  sanskrit: string;
  category: string;
  tradition: string;
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
  image?: string;
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
