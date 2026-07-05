"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { fireCelebration } from "@/lib/confetti";

// Electric Azure / white tones for the celebration on the matte black feed.
const BURST_COLORS = ["#3B82F6", "#60A5FA", "#ffffff", "#93C5FD", "#2563EB"];

export default function CompletionSlide({ total }: { total: number }) {
  const { status, update } = useSession();

  // All feed slides (including this one) are mounted up front, not just when
  // scrolled to - so celebrating on mount would fire immediately when the
  // study session starts. Fire only when the slide actually enters the
  // viewport, and only the first time (scrolling back past it shouldn't
  // re-trigger the whole celebration).
  const hasCelebrated = useRef(false);

  function handleViewportEnter() {
    if (hasCelebrated.current) return;
    hasCelebrated.current = true;
    fireCelebration();
    void trackStreak();
  }

  // Records today's study session so the streak advances, then pushes the new
  // streak into the session so the navbar flame is right the moment the user
  // leaves the immersive study view. Best-effort: streak bookkeeping should
  // never interfere with the celebration, so failures are swallowed silently.
  async function trackStreak() {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/study/track", { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as { currentStreak?: number };
      if (typeof data.currentStreak === "number") {
        await update({ currentStreak: data.currentStreak });
      }
    } catch {
      // Ignore - the deck-complete celebration stands on its own.
    }
  }

  return (
    <motion.section
      onViewportEnter={handleViewportEnter}
      viewport={{ amount: 0.6 }}
      className="flex h-dvh w-full shrink-0 snap-start snap-always items-center justify-center px-6"
    >
      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {BURST_COLORS.map((color, i) => {
            const angle = (i / BURST_COLORS.length) * Math.PI * 2;
            return (
              <motion.span
                key={color}
                className="absolute h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{
                  x: Math.cos(angle) * 90,
                  y: Math.sin(angle) * 90,
                  opacity: 0,
                  scale: 1,
                }}
                transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.04 }}
              />
            );
          })}
        </div>

        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-4xl"
        >
          🔥
        </motion.div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
          Deck complete
        </h2>
        <p className="mt-2 text-zinc-400">
          {`You made it through all ${total} concepts. That's active recall, done.`}
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/ingest"
            className="rounded-full border border-white/10 bg-gradient-to-b from-blue-500 to-blue-600 ring-1 ring-inset ring-blue-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_24px_-6px_rgba(37,99,235,0.55)] px-6 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:from-blue-400 hover:to-blue-500"
          >
            Ingest more notes
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
