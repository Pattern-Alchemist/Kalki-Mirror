"use client";

// =============================================================
// VOL. 2 #13 — Content Studio client wrapper
// -------------------------------------------------------------
// Renders the CalendarView (Vol. 2 #13) above the existing
// ContentClient (Vol. 4 #2). Both are client components.
// =============================================================

import { CalendarView } from "./CalendarView";
import { ContentClient } from "./content-client";
import type { ContentRow } from "./constants";

interface ContentStudioClientProps {
  initialEntries: ContentRow[];
  totalPages: number;
  currentPage: number;
  currentType: string;
  currentStatus: string;
}

export function ContentStudioClient(props: ContentStudioClientProps) {
  return (
    <div className="space-y-6">
      <CalendarView />
      <ContentClient {...props} />
    </div>
  );
}
