"use client";

import { useCallback, useMemo, useState } from "react";
import {
	useScriptControl,
	useScriptInitial,
} from "@/lib/script/ScriptProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getContentElements } from "@/lib/canvas/scenes";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { useAspectRatio } from "@/lib/video/useAspectRatio";
import { useTransitionType } from "@/lib/video/useTransitionType";
import InlineCopilot from "./copilot/InlineCopilot";
import RefineThread from "./copilot/RefineThread";
import Canvas from "./canvas/Canvas";
import { ProjectTitle } from "./canvas/ProjectTitle";
import { useEditorSetup } from "./canvas/hooks/useEditorSetup";
import { useAutosave } from "./canvas/hooks/useAutosave";
import { useGenerateAll } from "./canvas/hooks/useGenerateAll";
import { useMetadataSync } from "./canvas/hooks/useMetadataSync";
import { useProjectRehydrate } from "./canvas/hooks/useProjectRehydrate";
import { useScriptSync } from "./canvas/hooks/useScriptSync";
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
import { RefineChangesContext } from "./scene-selection/RefineChangesContext";
import { AutoScrollProvider } from "./scene-selection/AutoScrollContext";
import { PlayerControlProvider } from "./video/PlayerControlContext";
import { VideoLayoutProvider } from "./video/VideoLayoutContext";
import editorStyles from "./Editor.module.css";
import genStyles from "./styles/gen-button.module.css";

function PostPromptViewInner() {
	const { loading: scriptLoading, stopGeneration } = useScriptControl();
	const { editor, value, setValue } = useEditorSetup();
	const { projectId } = useConfig();
	const initialScript = useScriptInitial();
	useProjectRehydrate(editor, initialScript);
	useAutosave(projectId, value);
	useScriptSync(editor);
	useMetadataSync();
	const { generateAll } = useGenerateAll(editor);

	const transitionType = useTransitionType();
	const aspectRatio = useAspectRatio();
	const layoutKey = useMemo(
		() => getLayoutKey(getContentElements(value), transitionType),
		[value, transitionType],
	);

	const [refineValue, setRefineValue] = useState("");
	const { position, visible } = usePlayerPosition();
	const {
		refineScript,
		refineLoading,
		stopRefine,
		latestTurn,
		applyTurn,
		discardTurn,
		changes,
	} = useRefineScript(editor);

	const runRefine = useCallback(
		(prompt: string) => {
			if (prompt.trim()) refineScript(prompt);
		},
		[refineScript],
	);

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
		<RefineChangesContext value={changes}>
			<div className="flex h-screen w-full flex-col overflow-hidden">
				<div
					className={`z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-3 pb-2 pl-16 ${editorStyles.copilotEnter}`}
				>
					<div className="flex w-full items-start justify-center gap-3">
						<div className="flex min-w-0 max-w-2xl flex-1 flex-col gap-2">
							<InlineCopilot
								value={refineValue}
								onValueChange={setRefineValue}
								onSubmit={() => {
									runRefine(refineValue);
									setRefineValue("");
								}}
								onStop={stop}
								loading={loading}
								placeholder="Refine your script…"
							/>
							<RefineThread
								latestTurn={latestTurn}
								loading={loading}
								onApply={applyTurn}
								onDiscard={discardTurn}
								onSuggest={runRefine}
							/>
						</div>
						<button
							type="button"
							onClick={generateAll}
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

				<VideoLayoutProvider
					editor={editor}
					layoutKey={layoutKey}
					transitionType={transitionType}
					aspectRatio={aspectRatio}
				>
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
											<Canvas
												editor={editor}
												value={value}
												setValue={setValue}
											/>
										</div>
									</div>

									{visible && !isTop && <SidePlayerPanel />}
								</div>
							</AutoScrollProvider>
						</ActiveSceneProvider>
					</PlayerControlProvider>
				</VideoLayoutProvider>
			</div>
		</RefineChangesContext>
	);
}

export default function PostPromptView() {
	return (
		<PlayerPositionProvider>
			<PostPromptViewInner />
		</PlayerPositionProvider>
	);
}
