"use client";

import { useEffect, useState, type FormEvent } from "react";

/* ─── The 10 Doors — mirrors docs/growth/navratri26-shorts-scripts.md ─────── */

const REF_STORAGE_KEY = "kr_course_ref"; // Vol. 2 #18 — ?ref capture, survives navigation

const DOORS: { n: number; deity: string; loop: string }[] = [
  { n: 1, deity: "Kālī", loop: "The loop of endings you keep reopening" },
  { n: 2, deity: "Tārā", loop: "The loop of chaos you mistake for living" },
  { n: 3, deity: "Tripura Sundarī", loop: "The loop of desire that never fills" },
  { n: 4, deity: "Bhuvaneśvarī", loop: "The loop of controlling what was never yours" },
  { n: 5, deity: "Bhairavī", loop: "The loop of anger you swallow" },
  { n: 6, deity: "Chhinnamastā", loop: "The loop of giving until you vanish" },
  { n: 7, deity: "Dhūmāvatī", loop: "The loop of emptiness you keep busy to avoid" },
  { n: 8, deity: "Bagalāmukhī", loop: "The loop of starting and stopping" },
  { n: 9, deity: "Mātaṅgī", loop: "The loop of silencing your own voice" },
  { n: 10, deity: "Kamalā", loop: "The loop of never feeling worth it" },
];

type FormState = "idle" | "sending" | "success" | "error";

/* Vol. 2 #18 — the subscriber's personal share link, minted server-side
 * (the HMAC secret never leaves the server) and copied with one tap. */
function ShareLink({ email }: { email: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/email-course/share-link?email=${encodeURIComponent(email)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j?.ok) setUrl(j.url as string);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [email]);

  if (!url) return null;
  return (
    <div className="mt-6 rounded-lg border border-white/10 bg-deep-black/60 p-4 text-left">
      <p className="text-xs uppercase tracking-[0.2em] text-copper">Your door to share</p>
      <p className="mt-2 text-xs text-foreground/50">
        Know someone living these loops? Send them their door — signups through your link are counted for you.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-white/5 px-3 py-2 text-xs text-foreground/70">{url}</code>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(url).then(
              () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              },
              () => {},
            );
          }}
          className="rounded border border-gold/30 px-3 py-2 text-xs text-gold transition hover:bg-gold/10"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

export default function EmailCourseClient() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bots fill it; humans never see it
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [refToken, setRefToken] = useState<string | null>(null);

  // Vol. 2 #18 — a subscriber's share link lands here as /email-course?ref=<token>.
  // Stash it before anything else can redirect; it rides along with the POST.
  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("ref");
      if (fromUrl) {
        window.localStorage.setItem(REF_STORAGE_KEY, fromUrl);
        setRefToken(fromUrl);
        return;
      }
      setRefToken(window.localStorage.getItem(REF_STORAGE_KEY));
    } catch {
      /* private mode / storage blocked — attribution degrades, signup fine */
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/email-course/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website: honeypot, ref: refToken ?? undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setState("success");
      } else {
        setState("error");
        setMessage(data.error || "Could not subscribe. Try again shortly.");
      }
    } catch {
      setState("error");
      setMessage("Could not subscribe. Check your connection and try again.");
    }
  }

  return (
    <div className="bg-deep-black min-h-screen text-white">
      {/* ═══════ HERO ═══════ */}
      <section className="relative flex min-h-[70vh] items-end">
        <div className="atmospheric-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-16 pt-28 lg:px-10">
          <p className="section-label mb-4">A FREE 10-DAY COURSE</p>
          <h1 className="font-display text-4xl font-light tracking-wide md:text-6xl lg:text-7xl">
            Ten doors.
            <br />
            <span className="text-copper">Ten patterns.</span> Ten keys.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-foreground/70 editorial-spacing">
            One email a day. Each opens one Mahāvidyā — not as a goddess to worship,
            but as a mirror: the same karmic loop, wearing a different face, running
            the same scene in your life again and again.
          </p>
          <p className="mt-4 max-w-2xl text-base text-foreground/50 editorial-spacing">
            By the tenth door you will know exactly which loop has been running you —
            and what it would take to step out of it.
          </p>
        </div>
      </section>

      {/* ═══════ THE DOORS ═══════ */}
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <p className="section-label mb-8">THE CURRICULUM</p>
        <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {DOORS.map((d) => (
            <div key={d.n} className="bg-deep-black p-5">
              <p className="font-mono text-[0.7rem] tracking-[0.25em] text-copper">
                DOOR {String(d.n).padStart(2, "0")}
              </p>
              <p className="font-display mt-2 text-lg font-light">{d.deity}</p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/50">{d.loop}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FORM ═══════ */}
      <section className="mx-auto max-w-2xl px-6 pb-24 lg:px-10">
        <div className="rounded-xl border border-gold/20 bg-white/[0.03] p-8 md:p-10">
          {state === "success" ? (
            <div className="text-center">
              <p className="section-label mb-4">THE THRESHOLD</p>
              <h2 className="font-display text-3xl font-light">You&apos;re through the first gate.</h2>
              <p className="mt-4 text-foreground/70 editorial-spacing">
                Your address is on the list. Door 1 opens with the next course cycle —
                aligned to the Navratri wave (Oct 11). No spam, no forwarding, no noise:
                one door a day for ten days, then silence unless you ask for more.
              </p>
              {email.trim() && <ShareLink email={email.trim().toLowerCase()} />}
            </div>
          ) : (
            <>
              <p className="section-label mb-4">STEP THROUGH</p>
              <h2 className="font-display text-2xl font-light md:text-3xl">
                Begin at Door 1.
              </h2>
              <p className="mt-3 text-sm text-foreground/50">
                One email a day for ten days. Free. Unsubscribe with one click — your
                address never leaves the archivist&apos;s desk.
              </p>
              <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                {/* Honeypot — visually hidden, humans never tab into it */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="w-full rounded-lg border border-white/15 bg-black/40 px-5 py-4 text-white placeholder:text-foreground/30 focus:border-gold/40 focus:outline-none"
                />
                {state === "error" && (
                  <p className="text-sm text-red-400">{message}</p>
                )}
                <button
                  type="submit"
                  disabled={state === "sending" || email.trim().length < 5}
                  className="w-full rounded-lg bg-gold/90 px-6 py-4 font-mono text-sm tracking-[0.2em] text-black uppercase transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {state === "sending" ? "Opening…" : "Open Door 1"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-foreground/40">
                Already know which loop is yours?{" "}
                <a href="/consultations" className="text-copper underline underline-offset-4 hover:text-gold">
                  Book the Mirror Method session
                </a>{" "}
                instead.
              </p>
            </>
          )}
        </div>
      </section>

      {/* ═══════ BINDU PULSE FOOTER ═══════ */}
      <div className="relative mt-8 pb-24 md:pb-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-6 text-center lg:px-10">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-gold/20">
            <div className="bindu-pulse h-3 w-3 rounded-full bg-gold/40" />
          </div>
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.2em] text-copper">
            THE 10 DOORS — ASTROKALKI
          </p>
        </div>
      </div>
    </div>
  );
}
