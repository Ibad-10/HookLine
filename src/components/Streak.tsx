// Animated streak badge and this week's practice days (design canvas: Home).
import { Check } from "lucide-react";

const DAY = 86_400_000;

export function StreakBadge({ days }: { days: number }) {
  return (
    <span title="Days practised in a row" className="relative flex items-center gap-1.5 rounded-full bg-[#fff4e0] py-1.5 pl-2.5 pr-3.5 text-lg font-bold text-[#8a5a00] shadow-[0_0_0_1px_rgba(201,138,28,0.35),0_3px_0_#e8c98f] dark:bg-[#2a1d05] dark:text-[#ffcf80]">
      {days > 0 && (
        <>
          <span aria-hidden className="spark absolute -top-1 left-1.5 size-1.5 rounded-full bg-mark" />
          <span aria-hidden className="spark absolute right-1 top-0.5 size-1 rounded-full bg-[#ff8a3d]" style={{ animationDelay: ".5s" }} />
        </>
      )}
      <svg aria-hidden className={days ? "flame" : ""} width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 2s5 4.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 1-3.5S9 11 10.5 11C10.5 7 12 2 12 2z" fill={days ? "#ff9f1c" : "#d4d4d4"} stroke={days ? "#c96a00" : "#a3a3a3"} strokeWidth="1.2" />
        {days > 0 && <path d="M12 10s2.4 2 2.4 4.4a2.4 2.4 0 0 1-4.8 0c0-1.4 1-2.2 1-2.2s.3.9 1 .9c0-1.6.4-3.1.4-3.1z" fill="#ffe08a" />}
      </svg>
      <span className="count-pop">{days}</span>
      <span className="sr-only"> days in a row</span>
    </span>
  );
}

// Monday-to-Sunday row for the current week.
export function WeekRow({ times, now }: { times: number[]; now: number }) {
  const today = Math.floor(now / DAY);
  const dow = (new Date(now).getUTCDay() + 6) % 7; // 0 = Monday
  const practised = new Set(times.map((t) => Math.floor(t / DAY)));
  return (
    <ol aria-label="This week" className="mt-4 grid grid-cols-7 gap-1.5 text-center">
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
        const day = today - dow + i;
        const done = practised.has(day);
        const isToday = day === today;
        return (
          <li key={i} className={`text-sm ${isToday ? "font-bold text-ink" : "text-ink-soft"}`}>
            {d}
            {done ? (
              <span className="day-in mx-auto mt-1.5 grid size-8 place-items-center rounded-full bg-[#ff9f1c] text-white shadow-[0_3px_0_#c96a00]" style={{ animationDelay: `${i * 0.08}s` }}>
                <Check className="size-4" strokeWidth={3.5} aria-label="practised" />
              </span>
            ) : isToday ? (
              <span className="today mx-auto mt-1.5 grid size-8 place-items-center rounded-full bg-card text-[0.65rem] text-[#c96a00]">today</span>
            ) : (
              <span className="mx-auto mt-1.5 block size-8 rounded-full bg-secondary" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
