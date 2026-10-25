// Hookline mark: a fishing hook (eye, shank, barbed point) with the bait in amber.
// "Spot the bait before you bite." Uses the app's blue and highlighter amber.
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#0068ad" />
      <circle cx="18" cy="6.6" r="2.3" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M18 9v10.2a5.2 5.2 0 1 1-10.4 0v-3.4l3 2.8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.6" cy="11.4" r="2.6" fill="#ffb840" />
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
