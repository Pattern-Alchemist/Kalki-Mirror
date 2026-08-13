"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const LABELS: Record<string, string> = {
  overview: "Overview",
  members: "Members",
  keys: "Golden Keys",
  content: "Content Studio",
  folio: "Folio Corpus",
  consultations: "Consultations",
  audit: "Audit Log",
  settings: "Settings",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  // pathname = /admin/overview, /admin/members/abc123, etc.
  const segments = pathname.split("/").filter(Boolean); // ["admin", "overview"]

  // Only render if we're inside the dashboard (not just /admin)
  if (segments.length < 2) return null;

  const crumbs: { label: string; href?: string }[] = [
    { label: "Console", href: "/admin/overview" },
  ];

  // Add the section
  const section = segments[1]; // overview, members, keys, etc.
  if (LABELS[section]) {
    // Don't link the current page
    const isCurrentPage = segments.length === 2;
    crumbs.push({
      label: LABELS[section],
      href: isCurrentPage ? undefined : `/admin/${section}`,
    });
  }

  // If there's a deeper segment (e.g., member ID)
  if (segments.length > 2) {
    const id = segments[2];
    crumbs.push({
      label: id.length > 12 ? `${id.slice(0, 12)}...` : id,
    });
  }

  return (
    <nav aria-label="Admin breadcrumbs" className="mb-6 flex items-center gap-1.5 text-xs text-zinc-600">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-zinc-700">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="transition hover:text-zinc-400">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-zinc-400">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}