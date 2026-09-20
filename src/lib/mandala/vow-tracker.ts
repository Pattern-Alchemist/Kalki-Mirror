// =============================================================
// AUDIT2 #36 — 40-day Maṇḍala vow tracker
// -------------------------------------------------------------
// Traditional sādhana runs in 40-day maṇḍala cycles. This module
// manages client-side vow tracking via localStorage:
//   · Start a vow: pick a folio + start date
//   · Daily log: mark each day as completed
//   · Day counter: "Day 7 of 40"
//   · Completion certificate: client-side generated when all 40 done
//
// All data stays in the browser — zero server cost, zero infrastructure.
// =============================================================

const STORAGE_KEY = 'kalki-mandala-vows';

export interface VowDay {
  date: string; // ISO date (YYYY-MM-DD)
  completed: boolean;
  notes?: string;
}

export interface Vow {
  id: string;
  folioSlug: string;
  folioName: string;
  startDate: string; // ISO date
  targetDays: number; // typically 40
  days: VowDay[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export function getVows(): Vow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Vow[]) : [];
  } catch {
    return [];
  }
}

export function saveVows(vows: Vow[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vows));
  } catch { /* ignore quota errors */ }
}

export function startVow(folioSlug: string, folioName: string, targetDays: number = 40): Vow {
  const vow: Vow = {
    id: crypto.randomUUID(),
    folioSlug,
    folioName,
    startDate: new Date().toISOString().slice(0, 10),
    targetDays,
    days: [],
    completed: false,
    createdAt: new Date().toISOString(),
  };
  const vows = getVows();
  vows.push(vow);
  saveVows(vows);
  return vow;
}

export function markDayComplete(vowId: string, date: string, notes?: string): void {
  const vows = getVows();
  const vow = vows.find(v => v.id === vowId);
  if (!vow) return;
  const existing = vow.days.find(d => d.date === date);
  if (existing) {
    existing.completed = !existing.completed; // toggle
    if (notes) existing.notes = notes;
  } else {
    vow.days.push({ date, completed: true, notes });
  }
  // Check completion
  const completedDays = vow.days.filter(d => d.completed).length;
  if (completedDays >= vow.targetDays && !vow.completed) {
    vow.completed = true;
    vow.completedAt = new Date().toISOString();
  }
  saveVows(vows);
}

export function deleteVow(vowId: string): void {
  const vows = getVows().filter(v => v.id !== vowId);
  saveVows(vows);
}

export function getVowProgress(vow: Vow): {
  completedDays: number;
  currentDay: number;
  remainingDays: number;
  percent: number;
} {
  const completedDays = vow.days.filter(d => d.completed).length;
  const startDate = new Date(vow.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / 86_400_000);
  const currentDay = Math.min(daysSinceStart + 1, vow.targetDays);
  return {
    completedDays,
    currentDay,
    remainingDays: vow.targetDays - completedDays,
    percent: Math.round((completedDays / vow.targetDays) * 100),
  };
}

/**
 * Generate a completion certificate as a printable HTML string.
 * Used by the /practice/mandala page when a vow is completed.
 */
export function generateCertificate(vow: Vow): string {
  return `
    <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px; text-align: center;">
      <h1 style="font-size: 24px; letter-spacing: 0.1em;">Maṇḍala Complete</h1>
      <p style="font-size: 14px; color: #666;">This certifies that</p>
      <p style="font-size: 18px; font-weight: bold;">A seeker has completed</p>
      <p style="font-size: 20px;">${vow.targetDays} days of ${vow.folioName}</p>
      <p style="font-size: 14px; color: #666;">Started: ${new Date(vow.startDate).toLocaleDateString()}</p>
      <p style="font-size: 14px; color: #666;">Completed: ${vow.completedAt ? new Date(vow.completedAt).toLocaleDateString() : '—'}</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
      <p style="font-size: 12px; color: #999;">KALKI Mirror · astrokalki.com</p>
    </div>
  `;
}
