"use client";

import { useCallback, useRef, useState } from "react";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import InlineCopilot from "./copilot/InlineCopilot";
import Canvas, { type CanvasHandle } from "./canvas/Canvas";
import { ProjectTitle } from "./canvas/ProjectTitle";
import { useRefineScript } from "./canvas/hooks/useRefineScript";
import { Sparkles, X } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopPlayerPanel, SidePlayerPanel } from "./video/PlayerPanel";
import {
	PlayerPositionProvider,
	usePlayerPosition,
} from "./video/PlayerPositionContext";
import { ActiveSceneProvider } from "./scene-selection/ActiveSceneContext";
import { AutoScrollProvider } from "./scene-selection/AutoScrollContext";
import { PlayerControlProvider } from "./video/PlayerControlContext";
import { VideoLayoutProvider } from "./video/VideoLayoutContext";
import editorStyles from "./Editor.module.css";
import genStyles from "./styles/gen-button.module.css";

function PostPromptViewInner() {
	const { loading: scriptLoading, stopGeneration } = useScriptControl();
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

	const queue = useGenerationQueue();
	const generating = useQueueSelector((q) => q.isBusy());
	const loading = scriptLoading || refineLoading;
	const busy = loading || generating;
	const stop = scriptLoading ? stopGeneration : stopRefine;
	const canCancel = generating && !loading;
	const generateLabel = scriptLoading
		? "Writing…"
		: refineLoading
			? "Refining…"
			: generating
				? "Generating…"
				: "Generate";

	const isTop = position === "top";

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden">
			<div
				className={`z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-3 pb-2 pl-16 ${editorStyles.copilotEnter}`}
			>
				<div className="flex w-full items-stretch justify-center gap-3">
					<div className="min-w-0 flex-1 max-w-2xl">
						<InlineCopilot
							value={refineValue}
							onValueChange={setRefineValue}
							onSubmit={() => {
								refineScript(refineValue);
								setRefineValue("");
							}}
							onStop={stop}
							loading={loading}
							placeholder="Refine your script…"
						/>
					</div>
					<button
						type="button"
						onClick={() => canvasRef.current?.generateAll()}
						className={`${genStyles.btn} ${generating ? genStyles.generating : ""} shrink-0 transition-opacity ${busy ? "" : "opacity-80 hover:opacity-100"}`}
						aria-label={generateLabel}
						disabled={busy}
					>
						<Sparkles className={genStyles.svg} aria-hidden="true" />
						<span>{generateLabel}</span>
					</button>
					{canCancel && (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									onClick={() => queue.cancelAll()}
									aria-label="Cancel generation"
									className="grain grain-light relative flex h-7 w-7 shrink-0 items-center justify-center self-center overflow-hidden rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20"
								>
									<X className="h-3 w-3" aria-hidden="true" />
								</button>
							</TooltipTrigger>
							<TooltipContent>Cancel generation</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>

			<VideoLayoutProvider getEditor={getEditor} layoutKey={layoutKey}>
				<PlayerControlProvider>
					<ActiveSceneProvider>
						<AutoScrollProvider>
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
						</AutoScrollProvider>
					</ActiveSceneProvider>
				</PlayerControlProvider>
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
