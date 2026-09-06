"use client";

import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  CalendarDays,
  MapPin,
  Globe2,
  Download,
  ShieldAlert,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { updateBirthProfile, issueDeletionToken } from "./actions";
import { fadeInUp } from "@/lib/motion/tokens";

/* =============================================================
   PROFILE CLIENT — birth profile editor + DPDP self-service.
   Server actions do the validating and the auditing; this
   component only renders honest state.
   ============================================================= */

export interface ProfileUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tier: string;
  memberSince: string;
  birth: {
    birthDate: string | null;
    birthPlace: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    natalMoonLng: number | null;
  };
}

type FormState = {
  birthDate: string;
  birthPlace: string;
  latitude: string;
  longitude: string;
  timezone: string;
  natalMoonLng: string;
};

const TIER_LABELS: Record<string, string> = {
  prithvi: "Prithvi · Earth",
  jal: "Jal · Water",
  agni: "Agni · Fire",
  akash: "Akash · Sky",
};

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const [form, setForm] = useState<FormState>({
    birthDate: user.birth.birthDate ?? "",
    birthPlace: user.birth.birthPlace ?? "",
    latitude: user.birth.latitude?.toString() ?? "",
    longitude: user.birth.longitude?.toString() ?? "",
    timezone: user.birth.timezone ?? "",
    natalMoonLng: user.birth.natalMoonLng?.toString() ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deletionArmed, setDeletionArmed] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteState, setDeleteState] = useState<"idle" | "working" | "error">("idle");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((errs) => {
      if (!errs[key]) return errs;
      const next = { ...errs };
      delete next[key];
      return next;
    });
    setSaveState("idle");
  };

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    setSaveError(null);
    setFieldErrors({});
    const res = await updateBirthProfile(form);
    if (res.success) {
      setSaveState("saved");
    } else {
      setSaveState("error");
      setSaveError(res.error ?? "Something went wrong.");
      if (res.fieldErrors) setFieldErrors(res.fieldErrors);
    }
  }

  async function onDeleteConfirmed() {
    if (!deletionArmed) return;
    setDeleteState("working");
    setDeleteError(null);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: deletionArmed, confirmEmail }),
      });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setDeleteState("error");
      setDeleteError(data.error ?? `Deletion failed (${res.status}).`);
    } catch {
      setDeleteState("error");
      setDeleteError("Deletion failed — network error. Please try again.");
    }
  }

  const inputCls =
    "w-full bg-black/40 border border-white/10 rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors";
  const labelCls =
    "block text-[0.6rem] font-mono tracking-[0.2em] uppercase text-text-muted mb-1.5";

  const hasBirth =
    !!user.birth.birthDate || !!user.birth.birthPlace || user.birth.latitude != null;

  return (
    <div className="bg-deep-black min-h-screen text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-14 space-y-10">
        {/* ── Identity ── */}
        <header>
          <p className="text-[0.6rem] font-mono tracking-[0.3em] uppercase text-gold-dim mb-3">
            The Seeker&rsquo;s Ledger
          </p>
          <h1 className="font-display text-3xl md:text-4xl tracking-[0.04em] font-light">
            {user.name || "Unnamed Seeker"}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-secondary font-mono">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold/60" /> {user.email}
            </span>
            <span>Tier · {TIER_LABELS[user.tier] ?? user.tier}</span>
            <span>
              Member since{" "}
              {new Date(user.memberSince).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {/* ── Birth profile ── */}
        <motion.section
          className="border border-white/10 rounded-lg p-6 bg-white/[0.02]"
          initial={fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl tracking-[0.05em] font-light mb-1.5">
            Birth Profile
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed mb-5">
            These fields feed the transit engine and the Brahma-muhūrta pulse — the
            &ldquo;when&rdquo; and &ldquo;where&rdquo; behind your practice timings. They stay private to
            you; no admin surface writes or reads them. Leave a field blank to clear it.
          </p>

          <form onSubmit={onSave} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthDate" className={labelCls}>
                  <CalendarDays className="w-3 h-3 inline mr-1 -mt-0.5" /> Birth date
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={set("birthDate")}
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputCls}
                />
                {fieldErrors.birthDate && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.birthDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="birthPlace" className={labelCls}>
                  <MapPin className="w-3 h-3 inline mr-1 -mt-0.5" /> Birth place
                </label>
                <input
                  id="birthPlace"
                  type="text"
                  value={form.birthPlace}
                  onChange={set("birthPlace")}
                  placeholder="Varanasi, Uttar Pradesh"
                  className={inputCls}
                />
                {fieldErrors.birthPlace && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.birthPlace}</p>
                )}
              </div>
              <div>
                <label htmlFor="latitude" className={labelCls}>
                  Latitude (−90 to 90)
                </label>
                <input
                  id="latitude"
                  type="number"
                  step="any"
                  min={-90}
                  max={90}
                  value={form.latitude}
                  onChange={set("latitude")}
                  placeholder="25.3176"
                  className={inputCls}
                />
                {fieldErrors.latitude && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.latitude}</p>
                )}
              </div>
              <div>
                <label htmlFor="longitude" className={labelCls}>
                  Longitude (−180 to 180)
                </label>
                <input
                  id="longitude"
                  type="number"
                  step="any"
                  min={-180}
                  max={180}
                  value={form.longitude}
                  onChange={set("longitude")}
                  placeholder="82.9739"
                  className={inputCls}
                />
                {fieldErrors.longitude && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.longitude}</p>
                )}
              </div>
              <div>
                <label htmlFor="timezone" className={labelCls}>
                  <Globe2 className="w-3 h-3 inline mr-1 -mt-0.5" /> Timezone (IANA)
                </label>
                <input
                  id="timezone"
                  type="text"
                  value={form.timezone}
                  onChange={set("timezone")}
                  placeholder="Asia/Kolkata"
                  className={inputCls}
                />
                {fieldErrors.timezone && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.timezone}</p>
                )}
              </div>
              <div>
                <label htmlFor="natalMoonLng" className={labelCls}>
                  Natal Moon longitude (0–360)
                </label>
                <input
                  id="natalMoonLng"
                  type="number"
                  step="any"
                  min={0}
                  max={360}
                  value={form.natalMoonLng}
                  onChange={set("natalMoonLng")}
                  placeholder="137.42"
                  className={inputCls}
                />
                {fieldErrors.natalMoonLng && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.natalMoonLng}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button
                type="submit"
                disabled={saveState === "saving"}
                className="inline-flex items-center gap-2 bg-gold/90 hover:bg-gold text-black text-xs font-mono tracking-[0.15em] uppercase px-5 py-2.5 rounded-md transition-colors disabled:opacity-50"
              >
                {saveState === "saving" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saveState === "saved" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : null}
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save profile"}
              </button>
              {saveState === "error" && (
                <p className="text-red-400 text-xs">{saveError}</p>
              )}
              {saveState === "saved" && (
                <p className="text-emerald-400 text-xs">
                  Birth profile updated — the pulse recalibrates on your next visit.
                </p>
              )}
            </div>
          </form>
        </motion.section>

        {/* ── Data export (DPDP) ── */}
        <motion.section
          className="border border-white/10 rounded-lg p-6 bg-white/[0.02]"
          initial={fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl tracking-[0.05em] font-light mb-1.5">
            Your Data, In Your Hands
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed mb-5">
            Download everything the Archive holds about you as a single JSON file —
            profile, memberships, consultations, practice sessions, pattern resolutions,
            streaks, and email-list records. Credential material (password hash, 2FA
            secrets) is never included — it cannot leave the server.
          </p>
          <a
            href="/api/user/export"
            className="inline-flex items-center gap-2 border border-gold/40 hover:border-gold text-gold text-xs font-mono tracking-[0.15em] uppercase px-5 py-2.5 rounded-md transition-colors"
            onClick={(e) => {
              // Let the browser handle the download natively.
              e.stopPropagation();
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Download my data (JSON)
          </a>
        </motion.section>

        {/* ── Danger zone ── */}
        <motion.section
          className="border border-red-900/40 rounded-lg p-6 bg-red-950/10"
          initial={fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-xl tracking-[0.05em] font-light mb-1.5 inline-flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" /> Dissolution
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed mb-5">
            Deleting your account removes your profile, practice sessions, pattern
            resolutions, streaks, and email-list records. Business ledgers (membership
            and consultation records) are unlinked but retained for accounting. This
            cannot be undone.
          </p>

          {!deletionArmed ? (
            <button
              type="button"
              onClick={async () => {
                setDeleteState("idle");
                setDeleteError(null);
                const res = await issueDeletionToken();
                if (res.success && res.token) {
                  setDeletionArmed(res.token);
                  setConfirmEmail("");
                } else {
                  setDeleteState("error");
                  setDeleteError(res.error ?? "Could not start the deletion flow.");
                }
              }}
              className="inline-flex items-center gap-2 border border-red-800/60 hover:border-red-500 text-red-300 text-xs font-mono tracking-[0.15em] uppercase px-5 py-2.5 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Delete my account
            </button>
          ) : (
            <div className="space-y-3">
              <label htmlFor="confirmEmail" className={labelCls}>
                Type <span className="text-red-300">{user.email}</span> to confirm dissolution
              </label>
              <input
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className={inputCls}
                autoComplete="off"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={
                    deleteState === "working" ||
                    confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()
                  }
                  onClick={onDeleteConfirmed}
                  className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-mono tracking-[0.15em] uppercase px-5 py-2.5 rounded-md transition-colors"
                >
                  {deleteState === "working" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  {deleteState === "working" ? "Dissolving…" : "Dissolve account permanently"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeletionArmed(null);
                    setConfirmEmail("");
                  }}
                  className="text-xs font-mono tracking-[0.15em] uppercase text-text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
              {deleteError && <p className="text-red-400 text-xs">{deleteError}</p>}
            </div>
          )}
          {deleteState === "error" && !deletionArmed && deleteError && (
            <p className="text-red-400 text-xs mt-3">{deleteError}</p>
          )}
        </motion.section>

        {/* ── Footnote ── */}
        <p className="text-[0.65rem] text-text-muted/60 leading-relaxed">
          {hasBirth
            ? "Your birth data currently feeds the transit engine and the Brahma-muhūrta pulse."
            : "Add your birth data to activate the transit engine and the Brahma-muhūrta pulse."}{" "}
          Every change to this page is audit-logged.
        </p>
      </div>
    </div>
  );
}
