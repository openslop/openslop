"use client";

import { useCallback, useRef, useState } from "react";
import { useScript } from "@/lib/script/ScriptProvider";
import Copilot from "./Copilot";
import Canvas, { type CanvasHandle } from "./canvas/Canvas";
import { SparklesIcon } from "./canvas/elements/OutputPreview";
import { TopPlayerPanel, SidePlayerPanel } from "./video/PlayerPanel";
import {
  PlayerPositionProvider,
  usePlayerPosition,
} from "./video/PlayerPositionContext";
import { VideoLayoutProvider } from "./video/VideoLayoutContext";
import editorStyles from "./Editor.module.css";
import genStyles from "./styles/gen-button.module.css";

function PostPromptViewInner() {
  const { loading, refineScript, stopGeneration } = useScript();
  const canvasRef = useRef<CanvasHandle>(null);
  const [structureKey, setStructureKey] = useState("");
  const { position, visible, showPlayer } = usePlayerPosition();

  const getEditor = useCallback(
    () => canvasRef.current?.getEditor() ?? null,
    [],
  );

  const isTop = position === "top";

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <div
        className={`z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-3 pb-2 pl-16 ${editorStyles.copilotEnter}`}
      >
        <div className="flex w-full items-stretch justify-center gap-3">
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
            onClick={() => {
              canvasRef.current?.generateAll();
              showPlayer();
            }}
            className={`${genStyles.btn} shrink-0 transition-opacity ${loading ? "" : "opacity-80 hover:opacity-100"}`}
            aria-label="Generate All"
            disabled={loading}
          >
            <SparklesIcon />
            <span className="hidden sm:inline">Generate All</span>
          </button>
        </div>
      </div>

      <VideoLayoutProvider getEditor={getEditor} structureKey={structureKey}>
        {visible && isTop && <TopPlayerPanel />}

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-gutter-stable">
            <div className="pointer-events-none sticky top-0 z-10 -mb-8 h-8 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="mx-auto max-w-6xl px-4 pt-4">
              <Canvas ref={canvasRef} onStructureChange={setStructureKey} />
            </div>
          </div>

          {visible && !isTop && <SidePlayerPanel />}
        </div>
      </VideoLayoutProvider>
    </div>
  );
}

export default function PostPromptView() {
  return (
    <PlayerPositionProvider>
      <PostPromptViewInner />
    </PlayerPositionProvider>
  );
}
