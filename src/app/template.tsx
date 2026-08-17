/**
 * Root template — wraps every page in a subtle fade transition.
 * Pure CSS animation with `prefers-reduced-motion` media query.
 * No JS execution required — zero client overhead.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  // page-enter-fade removed: 0.5s CSS opacity animation was blocking first paint.
  // Navigation transitions are handled by Next.js router + minimal JS.
  return <>{children}</>;
}