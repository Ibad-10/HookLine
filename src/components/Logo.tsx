// Hookline mark: a fishing hook on its line with the bait (amber) about to be taken.
// "Spot the bait before you bite." Uses the app's blue and highlighter amber.
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#0068ad" />
      <path d="M16 4.5v13.2a5.3 5.3 0 1 1-10.6 0v-1.8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.4 15.9l2.7 2.2" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="23" cy="20.5" r="3.6" fill="#ffb840" />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-lg font-semibold tracking-tight ${className}`}>
      <LogoMark />
      Hookline
    </span>
  );
}
