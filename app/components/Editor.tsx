"use client";

import { useState } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useScript } from "@/lib/script/ScriptProvider";
import UserProfile from "./UserProfile";
import ModeToggle from "./ModeToggle";
import Copilot from "./Copilot";

const INPUT_SCRIPT_PLACEHOLDER = `EXT. NIGHT STARRY SKY
Soft glowing stars twinkle quietly across a deep blue sky.
A large silver moon glows softly above peaceful clouds.
Gentle music begins.

NARRATOR (soft, soothing voice)
High above the quiet forests and sleepy hills…
past the drifting clouds…
there was a small glowing garden hidden on the moon.

And in that garden… lived a little rabbit named Lumi…`;

interface EditorUser {
  email: string;
  avatarUrl?: string;
  name?: string;
}

export default function Editor({ user }: { user: EditorUser }) {
  const { mode, setMode } = useConfig();
  const { script, loading, submitPrompt, refineScript, stopGeneration } =
    useScript();
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
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-[51]">
        <UserProfile
          email={user.email}
          avatarUrl={user.avatarUrl}
          name={user.name}
        />
      </div>

      <div
        className={`flex w-full max-w-2xl flex-col items-center px-4 ${
          prompted ? "pl-16 sm:pl-4" : ""
        }`}
      >
        <div
          className={`flex flex-col items-center transition-all duration-1000 ${
            prompted
              ? "opacity-0 max-h-0 overflow-hidden mb-0 pointer-events-none"
              : "opacity-100 max-h-[400px] mb-6"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h1 className="font-title text-center text-[clamp(48px,12vw,85px)] tracking-[-0.04em] leading-[0.95em] text-white/90 text-wrap-balance mb-6">
            {mode === "prompt" ? "Describe your video" : "Paste your script"}
          </h1>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>

        <div className={prompted ? "w-full animate-copilot-enter" : "w-full"}>
          <Copilot
            onSubmit={prompted ? refineScript : handleSubmit}
            onStop={stopGeneration}
            multiline={!prompted && mode === "inputScript"}
            loading={loading}
            placeholder={
              prompted
                ? "Refine your script…"
                : mode === "inputScript"
                  ? INPUT_SCRIPT_PLACEHOLDER
                  : undefined
            }
          />
        </div>
      </div>

      {hasScript && (
        <div className="w-full max-w-2xl px-4 pt-6">
          <pre className="font-body whitespace-pre-wrap text-sm text-white/70">
            {script}
            {loading && (
              <span className="inline-block w-2 h-4 ml-0.5 bg-violet-400/70 animate-pulse align-middle" />
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
