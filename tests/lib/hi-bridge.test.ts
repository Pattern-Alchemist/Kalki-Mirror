// =============================================================
// KALKI — hi LOCALE CORPUS BRIDGE tests (Vol. 4 #13)
// -------------------------------------------------------------
// The bridge contract: ≥20 glossary terms carry REAL Hindi (sadhu
// register, Devanagari script, never an EN echo), the picker falls
// back to EN for every locale/locale-less case, and the chrome
// namespace is parity-locked (the full-shell gate below also
// enforces this — the explicit pin is the cheap tripwire).
// =============================================================
import { describe, expect, it } from "vitest";
import { glossaryEntries } from "@/lib/data/glossary";
import { pickDefinition } from "@/lib/i18n/lexicon-bridge";
import en from "@/i18n/messages/en.json";
import hi from "@/i18n/messages/hi.json";

// Devanagari block + Devanagari Extended signs (danda, om, etc.)
const DEVANAGARI = /[\u0900-\u097F]/;

const translated = glossaryEntries.filter((e) => e.hi?.definition);

describe("the corpus bridge — translated terms", () => {
  it("at least 20 terms carry a hi definition (the roadmap first move)", () => {
    expect(translated.length).toBeGreaterThanOrEqual(20);
  });

  it("every hi definition is real Devanagari — never Latin transliteration", () => {
    for (const e of translated) {
      expect(
        DEVANAGARI.test(e.hi!.definition),
        `${e.term}: hi definition carries no Devanagari`
      ).toBe(true);
    }
  });

  it("no hi definition is an EN echo or a stub", () => {
    for (const e of translated) {
      const hiDef = e.hi!.definition;
      expect(hiDef.length, `${e.term}: hi definition too short`).toBeGreaterThan(60);
      expect(hiDef, `${e.term}: hi equals EN`).not.toBe(e.definition);
      // Latin word count must be small — terms like "KALKI"/"OM" may appear
      const latinWords = hiDef.split(/\s+/).filter((w) => /^[A-Za-z]{4,}$/.test(w));
      expect(latinWords.length, `${e.term}: too much Latin prose in hi`).toBeLessThanOrEqual(4);
    }
  });

  it("the foundational cluster is covered (Oṃ, Prāṇa, Nāḍī, the three primary nāḍīs)", () => {
    const terms = new Set(translated.map((e) => e.term));
    for (const t of ["Oṃ", "Prāṇa", "Nāḍī", "Iḍā", "Piṅgalā", "Suṣumṇā"]) {
      expect(terms.has(t), `${t} must be in the top-20 bridge set`).toBe(true);
    }
  });

  it("the practice + philosophy spine is covered (Sādhana, Prāṇāyāma, Dhyāna, Samādhi, Mokṣa, Tantra)", () => {
    const terms = new Set(translated.map((e) => e.term));
    for (const t of ["Sādhana", "Prāṇāyāma", "Kumbhaka", "Dhyāna", "Samādhi", "Mokṣa", "Karma", "Tantra", "Śakti", "Śiva"]) {
      expect(terms.has(t), `${t} must be in the top-20 bridge set`).toBe(true);
    }
  });
});

describe("pickDefinition — the EN-fallback invariant", () => {
  const enEntry = { definition: "English body", hi: undefined };
  const bridged = { definition: "English body", hi: { definition: "हिंदी विवरण — यहाँ पूर्ण परिभाषा है।" } };

  it("locale hi + translated term → hi text", () => {
    const p = pickDefinition(bridged, "hi");
    expect(p.text).toBe("हिंदी विवरण — यहाँ पूर्ण परिभाषा है।");
    expect(p.isHi).toBe(true);
    expect(p.hiAvailable).toBe(true);
  });

  it("locale hi + UNtranslated term → EN (never empty, never a stub)", () => {
    const p = pickDefinition(enEntry, "hi");
    expect(p.text).toBe("English body");
    expect(p.isHi).toBe(false);
    expect(p.hiAvailable).toBe(false);
  });

  it("locale en → EN even when a translation exists", () => {
    const p = pickDefinition(bridged, "en");
    expect(p.text).toBe("English body");
    expect(p.isHi).toBe(false);
    expect(p.hiAvailable).toBe(true);
  });

  it("missing/odd locale → EN (the default of last resort)", () => {
    expect(pickDefinition(bridged, undefined).text).toBe("English body");
    expect(pickDefinition(bridged, "sa").text).toBe("English body");
  });

  it("whitespace-only hi definition is treated as absent", () => {
    const p = pickDefinition({ definition: "English body", hi: { definition: "   " } }, "hi");
    expect(p.text).toBe("English body");
    expect(p.isHi).toBe(false);
  });
});

describe("lexicon chrome namespace (parity-locked)", () => {
  it("en and hi carry identical key sets in the lexicon namespace", () => {
    const enKeys = Object.keys((en as Record<string, Record<string, unknown>>).lexicon).sort();
    const hiKeys = Object.keys((hi as Record<string, Record<string, unknown>>).lexicon).sort();
    expect(hiKeys).toEqual(enKeys);
  });

  it("hi chrome is actually Devanagari (not EN strings copied)", () => {
    const lex = (hi as Record<string, Record<string, string>>).lexicon;
    expect(DEVANAGARI.test(lex.title)).toBe(true);
    expect(DEVANAGARI.test(lex.relatedTerms)).toBe(true);
    expect(DEVANAGARI.test(lex.relatedPractices)).toBe(true);
    expect(lex.title).not.toBe((en as Record<string, Record<string, string>>).lexicon.title);
  });

  it("ICU placeholders survive ({count}, {tier})", () => {
    const enLex = (en as Record<string, Record<string, string>>).lexicon;
    const hiLex = (hi as Record<string, Record<string, string>>).lexicon;
    expect(enLex.termCount).toContain("{count}");
    expect(hiLex.termCount).toContain("{count}");
    expect(enLex.tierPractice).toContain("{tier}");
    expect(hiLex.tierPractice).toContain("{tier}");
  });
});
