export default function Loading() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        <p className="font-mono text-xs text-text-muted tracking-[0.2em] uppercase">Loading</p>
      </div>
    </div>
  );
}
