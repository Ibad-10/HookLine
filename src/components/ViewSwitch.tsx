"use client";
import { useState } from "react";

// Charts / Table switch for the Mubit comparison (design canvas: Admin).
export default function ViewSwitch({ charts, table }: { charts: React.ReactNode; table: React.ReactNode }) {
  const [view, setView] = useState<"charts" | "table">("charts");
  const tab = (v: "charts" | "table", label: string) => (
    <button type="button" role="tab" aria-selected={view === v} onClick={() => setView(v)}
      className={`rounded-full px-4 py-2 text-[0.95rem] ${view === v ? "bg-background font-semibold ring-1 ring-line" : "text-ink-soft"}`}>
      {label}
    </button>
  );
  return (
    <div>
      <div role="tablist" aria-label="View" className="inline-flex gap-1 rounded-full bg-secondary p-1">
        {tab("charts", "Charts")}
        {tab("table", "Table")}
      </div>
      <div className="mt-4">{view === "charts" ? charts : table}</div>
    </div>
  );
}
