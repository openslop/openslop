"use client";

import { useEffect, useState, useRef } from "react";

const SUGGESTIONS = [
  "a claymation children's story about little red riding hood…",
  "a cinematic AI music video with powerful synthwave energy",
  "an infographic explainer video answering 'what if the world stops spinning?'",
  "a documentary-style video about the rise and fall of Rome…",
  "a heartwarming animal rescue video about a stray dog saved from a flood…",
  "a short animated cat story about a mischievous kitten…",
  "a cinematic space documentary with epic music about the search for alien civilizations…",
  "a dark documentary exploring an unsettling internet mystery…",
  "a “Top 5 Unsolved Archaeological Mysteries” video",
  "a colorful animated children’s story about a young rabbit…",
  "a calming bedtime documentary about life in an ancient medieval village…",
];

export default function AnimatedPlaceholder({ active }: { active: boolean }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exiting" | "entering">(
    "visible",
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;

    const clear = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const EXITING_DELAY = 2500;
    const ENTERING_DELAY = EXITING_DELAY + 20;

    timeoutRef.current = setTimeout(() => {
      setPhase("exiting");
    }, EXITING_DELAY);

    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % SUGGESTIONS.length);
      setPhase("entering");
    }, ENTERING_DELAY);

    return clear;
  }, [active, index, phase]);

  const animationClass =
    phase === "exiting"
      ? "animate-out fade-out slide-out-to-top-2 duration-300 fill-mode-forwards"
      : phase === "entering"
        ? "animate-in fade-in slide-in-from-bottom-2 duration-300"
        : "";

  return (
    <span
      key={index}
      aria-hidden="true"
      className={`pointer-events-none select-none text-white/30 truncate w-full block ${animationClass}`}
    >
      {SUGGESTIONS[index]}
    </span>
  );
}
