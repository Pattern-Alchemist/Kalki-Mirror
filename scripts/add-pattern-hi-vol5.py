#!/usr/bin/env python3
"""Vol. 5 #8 — hi corpus bridge scale-out, pattern folios: the 10 OPEN-caution
patterns (all patterns are prithvi-tier → OPEN). Same atomic discipline:
per-slug anchor window, one hi block inserted before the entry's minTier line,
skip if the entry already carries hi. Sadhu register, real Devanagari,
never an EN echo."""
import sys

PATH = 'src/lib/data/patterns.ts'
src = open(PATH, encoding='utf-8').read()

HI = {
 "the-rescuer": "वह पैटर्न जहाँ आप अपनी पहचान और मूल्य दूसरों को सुधारने, सहारा देने या बचाने से पाते हैं। छाया: जब बचाने को कोई नहीं होता, भीतर शून्य गूँजता है। जड़ प्रायः वह बचपन है जहाँ उपयोगिता ही स्नेह की शर्त थी।",
 "the-perfectionist": "वह पैटर्न जहाँ आत्म-मूल्य निर्दोष निष्पादन से बँधा है। छाया: कुछ भी कभी पर्याप्त नहीं — आप स्वयं भी नहीं। जड़ वह वातावरण है जहाँ केवल उपलब्धि ही स्वीकृति कमाती थी।",
 "the-ghost": "सतत आत्म-विलोपन का पैटर्न — आप सिकुड़ते हैं, सहमत होते हैं, समायोजित होते हैं और गायब होते जाते हैं, जब तक कि स्वयं को न पहचान सकें। छाया: आप केवल दूसरों के परावर्तनों में अस्तित्व में हैं।",
 "the-controller": "वह पैटर्न जहाँ चिंता को आधिपत्य, पूर्वानुमेयता और वातावरण-व मनुष्यों के नियंत्रण से प्रबंधित किया जाता है। छाया: घनिष्ठता आत्म-समर्पण माँगती है, और समर्पण विलय-भय जैसा लगता है।",
 "the-hermit": "रक्षात्मक एकांत का पैटर्न — अभिभूत होने पर आप संबंध से मुख मोड़ते हैं, फिर अकेलापन सताता है, फिर और गहरे मुख मोड़ते हैं। छाया: एकांत आश्रम के वेश में कारागार बन जाता है।",
 "the-chameleon": "प्रत्येक वातावरण से अपना रूप मिलाने का पैटर्न। छाया: वर्षों के अनुकूलन के बाद आप नहीं जानते कि क्या आपका मूल स्वभाव है और क्या अभिनय — पहचान दर्पणों में घुल जाती है।",
 "the-saboteur": "आत्म-विनाश का पैटर्न — आप कुछ सुंदर रचते हैं और फिर उसे गिरा देते हैं। छाया: सफलता खतरनाक लगती है, क्योंकि सफलता दृश्यता लाती है और दृश्यता निंदा बुलाती है।",
 "the-avoidant": "भावनात्मक उपेक्षा-मार्ग का पैटर्न — आप व्यस्त रहते हैं, उत्पादक रहते हैं, विचलित रहते हैं। छाया: आप धीरे-धीरे सब कुछ के प्रति संवेदनहीन होते जा रहे हैं — केवल पीड़ा नहीं। आनंद, शोक, प्रेम — सब सपाट होते जाते हैं।",
 "the-martyr": "वह पैटर्न जहाँ पीड़ा मुद्रा बन जाती है — आप त्याग से प्रेम कमाते हैं और अपराध-बोध आपको बाँधे रखता है। छाया: पीड़ा के बिना आप विश्राम या आनंद के योग्य नहीं लगते।",
 "the-pleaser": "वह पैटर्न जहाँ सामंजस्य किसी भी कीमत पर — अपने सत्य की कीमत सहित — बनाए रखा जाता है। छाया: आप चापलूसी को दया और मौन को शांति समझ बैठते हैं।",
}

inserted = 0
skipped = 0
anchors = [f"slug: '{s}'," for s in HI]
for slug, hi_text in HI.items():
    anchor = f"slug: '{slug}',"
    first = src.find(anchor)
    if first == -1:
        print(f"FATAL: slug anchor not found: {slug}", file=sys.stderr)
        sys.exit(1)
    if src.find(anchor, first + 1) != -1:
        print(f"FATAL: slug anchor not unique: {slug}", file=sys.stderr)
        sys.exit(1)
    # window ends at the NEXT slug anchor (or EOF) — entry-scoped edits only
    win_end = len(src)
    for other in anchors:
        if other == anchor:
            continue
        pos = src.find(other, first + 1)
        if pos != -1:
            win_end = min(win_end, pos)
    window = src[first:win_end]
    if "hi:" in window:
        print(f"SKIP: {slug} already carries hi", file=sys.stderr)
        skipped += 1
        continue
    mt = window.find("minTier:")
    if mt == -1:
        print(f"FATAL: no minTier line in window of {slug}", file=sys.stderr)
        sys.exit(1)
    indent = "    "
    block = (
        f"{indent}hi: {{\n"
        f"{indent}  definition:\n"
        f"{indent}    '{hi_text}',\n"
        f"{indent}}},\n"
    )
    abs_off = first + mt
    src = src[:abs_off] + block + src[abs_off:]
    inserted += 1

open(PATH, 'w', encoding='utf-8').write(src)
print(f"inserted {inserted} pattern hi blocks, skipped {skipped}")
