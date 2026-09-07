/**
 * LIST FUNNEL — DB gather (Vol. 4 #3)
 *
 * The thin Prisma half of the list funnel: four bounded reads over tables
 * that already exist (EmailSubscriber, EmailSend, EmailEvent, Consultation),
 * then the PURE builder in list-funnel.ts does all the math. Kept separate
 * from the pure module so the unit tests never touch a live client.
 *
 * Callers own the fail-soft policy (war-room panel and the daily digest
 * each degrade on their own terms — a funnel is never load-bearing).
 */

import { db } from "@/lib/db";
import {
  buildListFunnel,
  LIST_FUNNEL_WEEKS,
  weekStartUtc,
  type ListFunnelResult,
} from "./list-funnel";

/** Row caps — the list is hundreds per wave; these bounds are generosity, not a squeeze. */
const MAX_SUBSCRIBERS = 5_000;
const MAX_DOOR3_SENDS = 20_000;
const MAX_EVENTS = 20_000;
const MAX_CONSULTATIONS = 5_000;

export async function getListFunnel(now: Date = new Date()): Promise<ListFunnelResult> {
  // Cohort subscribers joined within the window; their events can only
  // exist after that, so the event read is windowed too.
  const windowStart = weekStartUtc(new Date(now.getTime() - LIST_FUNNEL_WEEKS * 7 * 86_400_000));

  const [subscribers, door3Sends, events, consultations] = await Promise.all([
    db.emailSubscriber.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: MAX_SUBSCRIBERS,
    }),
    db.emailSend.findMany({
      where: { kind: "door", doorDay: 3 },
      select: { email: true, emailId: true },
      take: MAX_DOOR3_SENDS,
    }),
    db.emailEvent.findMany({
      where: { type: { in: ["email.opened", "email.clicked"] }, occurredAt: { gte: windowStart } },
      select: { email: true, emailId: true, type: true, url: true },
      orderBy: { occurredAt: "asc" },
      take: MAX_EVENTS,
    }),
    db.consultation.findMany({
      where: { createdAt: { gte: windowStart } },
      select: { email: true, createdAt: true },
      take: MAX_CONSULTATIONS,
    }),
  ]);

  return {
    available: true,
    cohorts: buildListFunnel({
      subscribers: subscribers.map((s) => ({ email: s.email, createdAt: s.createdAt.toISOString() })),
      door3Sends: door3Sends.map((s) => ({ email: s.email, emailId: s.emailId })),
      events: events.map((e) => ({ email: e.email, emailId: e.emailId, type: e.type, url: e.url })),
      consultations: consultations.map((c) => ({ email: c.email, createdAt: c.createdAt.toISOString() })),
      now,
    }),
  };
}
