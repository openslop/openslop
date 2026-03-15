"use client";

import { useState } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useScript } from "@/lib/script/ScriptProvider";
import UserProfile from "./UserProfile";
import ModeToggle from "./ModeToggle";
import Copilot from "./Copilot";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import Canvas from "./canvas/Canvas";
import type { UserProfileProps } from "./UserProfile";

const INPUT_SCRIPT_PLACEHOLDER = `EXT. NIGHT STARRY SKY
Soft glowing stars twinkle quietly across a deep blue sky.
A large silver moon glows softly above peaceful clouds.
Gentle music begins.

NARRATOR (soft, soothing voice)
High above the quiet forests and sleepy hills…
past the drifting clouds…
there was a small glowing garden hidden on the moon.

And in that garden… lived a little rabbit named Lumi…`;

export default function Editor({ user }: { user: UserProfileProps }) {
  const { mode, setMode } = useConfig();
  const { script, loading, submitPrompt, stopGeneration } = useScript();
  const [prompted, setPrompted] = useState(false);

  const hasScript = script.length > 0 || loading;

  const handleSubmit = (value: string) => {
    setPrompted(true);
    submitPrompt(value);
  };

  return (
    <div
      className={`flex min-h-screen flex-col items-center text-white transition-[padding] duration-700 ease-out ${
        hasScript ? "pt-4" : "pt-[30vh]"
      }`}
    >
      <div className="fixed top-4 left-4 z-[100]">
        <UserProfile {...user} />
      </div>

      {!prompted ? (
        <div className="flex w-full max-w-2xl flex-col items-center px-4">
          <div
            className="flex flex-col items-center opacity-100 max-h-[400px] mb-6 transition-[opacity,max-height,margin-bottom] duration-1000"
            style={{
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <h1 className="font-title text-center text-[clamp(48px,12vw,85px)] tracking-[-0.04em] leading-[0.95em] text-white/90 text-wrap-balance mb-6">
              {mode === "prompt" ? "Describe your video" : "Paste your script"}
            </h1>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          <Copilot
            onSubmit={handleSubmit}
            onStop={stopGeneration}
            multiline={mode === "inputScript"}
            loading={loading}
            placeholder={
              mode === "inputScript" ? (
                INPUT_SCRIPT_PLACEHOLDER
              ) : (
                <AnimatedPlaceholder active />
              )
            }
          />
        </div>
      ) : (
        <div className="flex w-full justify-center px-4 pl-16 animate-copilot-enter">
          <div className="w-full max-w-2xl">
            <Copilot
              onSubmit={submitPrompt}
              onStop={stopGeneration}
              multiline={false}
              loading={loading}
              placeholder="Refine your script…"
            />
          </div>
        </div>
      )}

      {prompted && (
        <div className="w-full max-w-6xl px-4 pt-6">
          <Canvas />
        </div>
      )}
    </div>
  );
}
