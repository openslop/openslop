"use client";

import { useRef, useState } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useScript } from "@/lib/script/ScriptProvider";
import Copilot from "./Copilot";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import Canvas, { type CanvasHandle } from "./canvas/Canvas";
import { SparklesIcon } from "./canvas/elements/OutputPreview";
import UserProfile from "./UserProfile";
import editorStyles from "./Editor.module.css";
import genStyles from "./styles/gen-button.module.css";

const INPUT_SCRIPT_PLACEHOLDER = `EXT. NIGHT STARRY SKY
Soft glowing stars twinkle quietly across a deep blue sky.
A large silver moon glows softly above peaceful clouds.
Gentle music begins.

NARRATOR (soft, soothing voice)
High above the quiet forests and sleepy hills…
past the drifting clouds…
there was a small glowing garden hidden on the moon.

And in that garden… lived a little rabbit named Lumi…`;

export default function Editor() {
  const { scriptMode, setScriptMode } = useConfig();
  const { script, loading, submitPrompt, stopGeneration, refineScript } =
    useScript();
  const canvasRef = useRef<CanvasHandle>(null);
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
      {!prompted && (
        <div className="fixed left-4 top-4 z-[100]">
          <UserProfile />
        </div>
      )}
      {prompted ? (
        <div
          className={`flex w-full items-stretch justify-center gap-3 px-4 pl-16 ${editorStyles.copilotEnter}`}
        >
          <div className="min-w-0 flex-1 max-w-2xl">
            <Copilot
              onSubmit={refineScript}
              onStop={stopGeneration}
              multiline={false}
              loading={loading}
              placeholder="Refine your script…"
            />
          </div>
          <button
            type="button"
            onClick={() => canvasRef.current?.generateAll()}
            className={`${genStyles.btn} shrink-0 transition-opacity ${loading ? "" : "opacity-80 hover:opacity-100"}`}
            aria-label="Generate All"
            disabled={loading}
          >
            <SparklesIcon />
            <span className="hidden sm:inline">Generate All</span>
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-2xl flex-col items-center px-4">
          <h1 className="font-title text-center text-[clamp(48px,12vw,85px)] tracking-[-0.04em] leading-[0.95em] text-white/90 text-wrap-balance mb-6">
            Describe your video
          </h1>

          <Copilot
            onSubmit={handleSubmit}
            onStop={stopGeneration}
            multiline
            loading={loading}
            scriptMode={scriptMode}
            onScriptModeChange={setScriptMode}
            placeholder={
              scriptMode ? (
                INPUT_SCRIPT_PLACEHOLDER
              ) : (
                <AnimatedPlaceholder active />
              )
            }
          />
        </div>
      )}

      {prompted && (
        <div className="w-full max-w-6xl px-4 pt-6">
          <Canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}
