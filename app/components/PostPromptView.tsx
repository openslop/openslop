"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { useScript } from "@/lib/script/ScriptProvider";
import { generationQueue } from "@/lib/generation/queue";
import Copilot from "./Copilot";
import Canvas, { type CanvasHandle } from "./canvas/Canvas";
import { ProjectTitle } from "./canvas/ProjectTitle";
import { useRefineScript } from "./canvas/hooks/useRefineScript";
import { Sparkles } from "lucide-react";
import { TopPlayerPanel, SidePlayerPanel } from "./video/PlayerPanel";
import {
	PlayerPositionProvider,
	usePlayerPosition,
} from "./video/PlayerPositionContext";
import { VideoLayoutProvider } from "./video/VideoLayoutContext";
import editorStyles from "./Editor.module.css";
import genStyles from "./styles/gen-button.module.css";

function PostPromptViewInner() {
	const { loading: scriptLoading, stopGeneration } = useScript();
	const canvasRef = useRef<CanvasHandle>(null);
	const [layoutKey, setLayoutKey] = useState("");
	const [refineValue, setRefineValue] = useState("");
	const { position, visible } = usePlayerPosition();

	const getEditor = useCallback(
		() => canvasRef.current?.getEditor() ?? null,
		[],
	);

	const { refineScript, refineLoading, stopRefine } =
		useRefineScript(getEditor);

	const generating = useSyncExternalStore(
		generationQueue.subscribe,
		generationQueue.isBusy,
	);
	const loading = scriptLoading || refineLoading;
	const busy = loading || generating;
	const stop = scriptLoading ? stopGeneration : stopRefine;

	const isTop = position === "top";

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden">
			<div
				className={`z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-3 pb-2 pl-16 ${editorStyles.copilotEnter}`}
			>
				<div className="flex w-full items-stretch justify-center gap-3">
					<div className="min-w-0 flex-1 max-w-2xl">
						<Copilot
							value={refineValue}
							onValueChange={setRefineValue}
							onSubmit={() => {
								refineScript(refineValue);
								setRefineValue("");
							}}
							onStop={stop}
							multiline={false}
							loading={loading}
							placeholder="Refine your script…"
						/>
					</div>
					<button
						type="button"
						onClick={() => canvasRef.current?.generateAll()}
						className={`${genStyles.btn} shrink-0 transition-opacity ${busy ? "" : "opacity-80 hover:opacity-100"}`}
						aria-label="Generate"
						disabled={busy}
					>
						<Sparkles className={genStyles.svg} aria-hidden="true" />
						<span>Generate</span>
					</button>
				</div>
			</div>

			<VideoLayoutProvider getEditor={getEditor} layoutKey={layoutKey}>
				{visible && isTop && <TopPlayerPanel />}

				<div className="flex min-h-0 flex-1 overflow-hidden">
					<div
						className="flex-1 overflow-y-auto"
						style={{ scrollbarGutter: "stable" }}
					>
						<div className="pointer-events-none sticky top-0 z-10 -mb-8 h-8 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,black,transparent)]" />
						<div className="mx-auto max-w-6xl px-4 py-4">
							<ProjectTitle />
							<Canvas ref={canvasRef} onLayoutKeyChange={setLayoutKey} />
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
