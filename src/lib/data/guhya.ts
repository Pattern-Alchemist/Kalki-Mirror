// =============================================================
// KALKI GUHYA — The Hidden Files (single source of truth)
// -------------------------------------------------------------
// The Field: documented occult arts, investigated paranormal
// claims, and lived experiences — governed by a closed verdict
// set and an evidence-first method. Study, not instruction:
// GUHYA documents; it does not teach performance.
// (Reconciled Specification v2.0 — the two-axis architecture.)
// =============================================================

export type GuhyaVerdict = 'Attested' | 'Contested' | 'Reported' | 'Debunked';

export const VERDICT_MEANINGS: Record<GuhyaVerdict, string> = {
  Attested: 'The evidence supports the account — documentary or physically examined.',
  Contested: 'Serious conflicts inside the record. The file stays open.',
  Reported: 'Sincerely claimed, unverifiable. Reported, never established.',
  Debunked: 'Established as misidentification. Kept on record as method.',
};

export const VERDICT_TONES: Record<GuhyaVerdict, { border: string; text: string; bg: string }> = {
  Attested: { border: 'rgba(212, 175, 55, 0.55)', text: 'var(--gold-bright)', bg: 'rgba(212, 175, 55, 0.1)' },
  Contested: { border: 'rgba(184, 115, 51, 0.5)', text: 'var(--copper)', bg: 'rgba(184, 115, 51, 0.1)' },
  Reported: { border: 'rgba(138, 138, 133, 0.45)', text: 'var(--text-muted)', bg: 'rgba(138, 138, 133, 0.08)' },
  Debunked: { border: 'rgba(138, 37, 44, 0.55)', text: '#c96a70', bg: 'rgba(138, 37, 44, 0.12)' },
};

export const EVIDENCE_REGISTERS = [
  {
    name: 'Anubhava',
    gloss: 'Testimony',
    line: 'Witness accounts, taken separately, conflict-mapped. Agreement is evidence; disagreement is recorded, not smoothed away.',
  },
  {
    name: 'Parīkṣā',
    gloss: 'Examination',
    line: 'The physical record: site visits, photographs, recreations, documents. What was measured, and what could not be.',
  },
  {
    name: 'Āgama',
    gloss: 'The textual record',
    line: 'What the tradition itself attests — cited precisely, with no claim that texts attest what they do not.',
  },
] as const;

export const GUHYA_CHAMBERS = [
  {
    key: 'occult',
    name: 'The Occult Door',
    line: 'What was concealed.',
    body: 'Documented arts — mantra-śāstra, yantra construction, tantra-jyotiṣa, the science of omen and sign — presented as textual history and lineal record. Study, not instruction: the dangerous folios stay Sealed.',
    status: 'Corpus open — graded Open to Sealed',
  },
  {
    key: 'paranormal',
    name: 'The Paranormal Door',
    line: 'What remains unexplained.',
    body: 'Case files with verdicts. Every claim is investigated through the three registers and closed with exactly one verdict — Attested, Contested, Reported, or Debunked. Absorbs the former Forensics and Observatory functions.',
    status: '4 files open — verdicts published',
  },
  {
    key: 'experiences',
    name: 'The Experiences Door',
    line: 'What was lived.',
    body: 'Testimony intake for seekers who have lived what they cannot name. Accounts feed the case pipeline — and build the trust engine behind every consultation.',
    status: 'Intake open — consent on file',
  },
] as const;

export interface GuhyaCaseFile {
  id: string;
  title: string;
  claimClass: string;
  verdict: GuhyaVerdict;
  location: string;
  received: string;
  registers: string[];
  report: string;
  finding: string;
}

export const GUHYA_CASE_FILES: GuhyaCaseFile[] = [
  {
    id: 'GH-2026-001',
    title: 'The Nimtalha Lamp',
    claimClass: 'Recurrent apparition, residential',
    verdict: 'Contested',
    location: 'Kumaon hills, Uttarakhand',
    received: 'Received 14 Feb 2026',
    registers: ['Anubhava', 'Parīkṣā', 'Āgama'],
    report:
      'A household of four reports a lamp in the disused storeroom found lit on three mornings across five weeks. The room has been locked since the grandmother\u2019s death; the key is held by one family member only. Two accounts agree in detail; the key-holder\u2019s conflicts with the others on the sequence of mornings \u2014 a conflict the household itself acknowledges.',
    finding:
      'The physical record supports that the lamp burned. It does not support who or what burned it, and the witness record is internally conflicted. The file stays open pending a documented monitoring period.',
  },
  {
    id: 'GH-2026-002',
    title: 'The 2:14 Corridor Figure',
    claimClass: 'Apparitional figure, sleep-adjacent',
    verdict: 'Debunked',
    location: 'Indiranagar, Bengaluru',
    received: 'Received 03 Jan 2026',
    registers: ['Anubhava', 'Parīkṣā'],
    report:
      'A tenant reports a tall figure in the corridor at 2:14 am \u2014 quarterly, always after late-night work, always between the hallway mirror and the bedroom door. Site visit at the reported hour: a streetlight through the stairwell window produces a standing human-form shadow at the exact position. Recreation photographed.',
    finding:
      'The physical record supports the shadow explanation; the sighting conditions reproduce it. What is worth keeping is the witness\u2019s own question: why the mind reaches for a spirit before a streetlight \u2014 which is a Mirror question, not a Field one.',
  },
  {
    id: 'GH-2026-003',
    title: 'The Lamp at Tripurāri Ghat',
    claimClass: 'Shrine phenomenon, public',
    verdict: 'Reported',
    location: 'Tripurāri Ghat, Varanasi',
    received: 'Received 22 Mar 2026',
    registers: ['Anubhava', 'Āgama'],
    report:
      'Three pilgrims, independently and without coordination, report the same phenomenon across two evenings: a second flame beside the sanctum lamp that follows no draft and leaves no wax. The shrine\u2019s keeper confirms he has \u201cseen it for years\u201d and declines documentation.',
    finding:
      'No physical record exists; accounts are sincere but unverifiable. Without documentation the file cannot advance beyond Reported \u2014 which is exactly what the register is for.',
  },
  {
    id: 'GH-2026-004',
    title: 'The Forensics Ledger',
    claimClass: 'Commercial fraud, paranormal branding',
    verdict: 'Attested',
    location: 'Gurugram, Haryana',
    received: 'Received 09 May 2026',
    registers: ['Parīkṣā'],
    report:
      'A complainant, having paid \u20b92.1 lakh across four escalating \u201ctantric remedies\u201d for a workplace dispute, approaches the platform. Payment receipts, dated chat transcripts, the practitioner\u2019s archived guarantee language, and two consumer-forum orders against the same office \u2014 the record is documentary end to end.',
    finding:
      'The documentary record supports the account completely. The paranormal framing was the costume; the escalating ladder was the machine. Serves as the bridge case between the Paranormal and Occult doors.',
  },
];
