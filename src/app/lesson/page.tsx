"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Quiz from "@/components/Quiz";
import type { NextLesson } from "@/lib/learner";

export default function LessonPage() {
  const [data, setData] = useState<NextLesson | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/lesson/next")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error)
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="text-2xl font-extrabold">Your lesson didn't load</h1>
        <p className="mt-2 text-ink-soft">Check your connection and try again. If you haven't started yet, set up first.</p>
        <Link href="/start" className="btn-chunky mt-6 grid place-items-center bg-tide text-white">Set up</Link>
      </main>
    );
  if (!data)
    return (
      <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5 text-center">
        <div>
          <p className="text-xl font-bold">Writing your lesson from this week's scam reports…</p>
          <div aria-hidden className="mx-auto mt-6 h-3 w-40 overflow-hidden rounded-full bg-line">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-tide" />
          </div>
        </div>
      </main>
    );

  return (
    <Quiz
      title={`${data.lesson.title}, from ${data.brief.source_name}`}
      cards={[{ heading: "Why this lesson", body: data.why }, ...data.lesson.cards]}
      items={data.lesson.quiz.map((question, q) => ({ lessonId: data.lessonId, q, question }))}
    />
  );
}
