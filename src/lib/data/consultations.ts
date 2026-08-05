import type { ConsultationService } from './types';

export const consultationServices: ConsultationService[] = [
  {
    slug: 'introductory-call',
    name: 'Archival Discovery',
    duration: '30 min',
    price: 'Free',
    description:
      'A no-obligation call to understand your practice background, discuss goals, and determine the right tier and siddhi pathway for you.',
    whatsappPrefill:
      'Hi, I\'d like to book an introductory discovery call. My name is ___ and I\'m interested in ___ .',
    popular: false,
  },
  {
    slug: 'practice-consultation',
    name: 'Pattern Consultation',
    duration: '60 min',
    price: '₹1,999 / $29',
    description:
      'A focused one-on-one session to refine your current practice, troubleshoot obstacles, and receive personalized guidance on technique and progression.',
    whatsappPrefill:
      'Hi, I\'d like to book a practice consultation. I\'m currently practicing ___ and facing challenges with ___ .',
    popular: true,
  },
  {
    slug: 'shadow-pattern-reading',
    name: 'Shadow Dossier',
    duration: '90 min',
    price: '₹3,499 / $49',
    description:
      'A deep-dive session identifying your dominant shadow patterns, their childhood origins, and prescribing specific siddhi practices as antidotes. Includes a written summary.',
    whatsappPrefill:
      'Hi, I\'d like to book a Shadow Pattern Reading. I\'ve been noticing the pattern of ___ in my life.',
    popular: false,
  },
  {
    slug: 'lineage-introduction',
    name: 'Lineage Introduction',
    duration: 'Varies',
    price: 'Akash tier only',
    description:
      'For serious practitioners ready for Restricted-level siddhis. An introduction to a vetted lineage holder in the relevant tradition, arranged through KALKI\'s network. Subject to vetting and availability.',
    whatsappPrefill:
      'Hi, I\'m an Akash-tier member interested in a lineage introduction for ___ practice. I have ___ years of experience.',
    popular: false,
  },
];
