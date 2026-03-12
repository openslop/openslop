"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import ModeToggle, { type Mode } from "./ModeToggle";

const SCRIPT_PLACEHOLDER = `EXT. NIGHT STARRY SKY
Soft glowing stars twinkle quietly across a deep blue sky.
A large silver moon glows softly above peaceful clouds.
Gentle music begins.

NARRATOR (soft, soothing voice)
High above the quiet forests and sleepy hills…
past the drifting clouds…
there was a small glowing garden hidden on the moon.

And in that garden… lived a little rabbit named Lumi…`;

export default function PromptInput() {
  const [mode, setMode] = useState<Mode>("prompt");
  const [promptValue, setPromptValue] = useState("");
  const [scriptValue, setScriptValue] = useState("");

  const value = mode === "prompt" ? promptValue : scriptValue;
  const hasText = value.trim().length > 0;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-4">
      <h1 className="font-title text-center text-[85px] tracking-[-0.04em] leading-[0.95em] text-white/90 text-wrap-balance">
        {mode === "prompt" ? "Describe your video" : "Paste your script"}
      </h1>

      <ModeToggle mode={mode} onChange={setMode} />

      <div className="w-full rounded-xl border border-violet-500/30 bg-white/5 shadow-[0_0_30px_rgba(55,30,100,0.3)] backdrop-blur-sm">
        {mode === "prompt" ? (
          <div className="relative flex items-center px-4 py-3">
            <Sparkles className="mr-3 h-5 w-5 shrink-0 text-violet-300" />
            <div className="relative flex-1">
              {!hasText && (
                <div className="font-body pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm">
                  <AnimatedPlaceholder active={!hasText} />
                </div>
              )}
              <input
                type="text"
                aria-label="Describe your video"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="font-body w-full bg-transparent text-sm text-white/80 caret-violet-400 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm"
              />
            </div>
            {hasText && (
              <button
                aria-label="Submit prompt"
                className="relative grain ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1f1528]/60 text-violet-300 transition-[filter] hover:brightness-[1.3]"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="relative px-4 py-3">
            <textarea
              rows={6}
              aria-label="Paste your script"
              value={scriptValue}
              onChange={(e) => setScriptValue(e.target.value)}
              placeholder={SCRIPT_PLACEHOLDER}
              className="font-body w-full resize-none bg-transparent text-sm text-white/80 caret-violet-400 placeholder:text-white/30 outline-none focus-visible:ring-2 focus-visible:ring-violet-400/30 focus-visible:rounded-sm h-[250px]"
            />
            {hasText && (
              <div className="flex justify-end pt-2">
                <button
                  aria-label="Submit script"
                  className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1f1528]/60 text-violet-300 transition-[filter] hover:brightness-[1.3]"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
