// =============================================================
// KALKI — Win-back template (Vol. 4 #4)
// -------------------------------------------------------------
// The default letter for the silently cold: subscribers who never
// unsubscribed but haven't opened anything in weeks. The voice
// rules are the house rules — no urgency theater, no offers, no
// list-metadata leakage ("we noticed you haven't opened…" never
// ships, in copy or in subject: the letter is archived publicly
// at /letters and personalization here would be creepy, not warm).
// One letter for everyone: buildWinbackEmail() takes no arguments.
//
// The output is PLAIN TEXT for the broadcast builder (buildBroadcast
// escapes it, renders the dark serif shell and attaches the signed
// one-click unsubscribe footer — RFC 8058 — at the send site).
// =============================================================

export const WINBACK_SUBJECT = "The door is still open";

export const WINBACK_BODY = `## The door is still open

You joined KALKI a while ago, and the letters went quiet on your side. That is
allowed. Practice has seasons.

If you want to pick the thread back up, the door is where you left it:

- The 10 Doors course resumes at your own pace - one lesson, one small practice, ten minutes.
- The library is open: patterns, sequences and the Lexicon, no gate and no clock.
- A consultation remains the shortest path back - one honest conversation, then a plan.

No promotion, no countdown. Just the work, still standing.

Walk in when you're ready,
KALKI`;

export function buildWinbackEmail(): { subject: string; body: string } {
  return { subject: WINBACK_SUBJECT, body: WINBACK_BODY };
}
