/**
 * Root template — wraps every page in a subtle fade transition.
 * Pure CSS animation with `prefers-reduced-motion` media query.
 * No JS execution required — zero client overhead.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter-fade">
      {children}
    </div>
  );
}