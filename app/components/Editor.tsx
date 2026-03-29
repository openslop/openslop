"use client";

import { useRef, useState } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useScript } from "@/lib/script/ScriptProvider";
import Copilot from "./Copilot";
import ComposerHero from "./ComposerHero";
import Canvas, { type CanvasHandle } from "./canvas/Canvas";
import { SparklesIcon } from "./canvas/elements/OutputPreview";
import UserProfile from "./UserProfile";
import editorStyles from "./Editor.module.css";
import genStyles from "./styles/gen-button.module.css";

export default function Editor() {
  const { composerMode, setComposerMode } = useConfig();
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
        <ComposerHero
          composerMode={composerMode}
          onModeChange={setComposerMode}
          loading={loading}
          onSubmit={handleSubmit}
          onStop={stopGeneration}
        />
      )}

      {prompted && (
        <div className="w-full max-w-6xl px-4 pt-6">
          <Canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}
