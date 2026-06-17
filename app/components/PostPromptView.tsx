"use client";

import { useMemo, useState } from "react";
import type { Editor } from "slate";
import {
	useScriptControl,
	useScriptInitial,
} from "@/lib/script/ScriptProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getContentElements, isSceneElement } from "@/lib/canvas/scenes";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { useAspectRatio } from "@/lib/video/useAspectRatio";
import { useTransitionType } from "@/lib/video/useTransitionType";
import InlineCopilot from "./copilot/InlineCopilot";
import UserProfile from "./UserProfile";
import Canvas from "./canvas/Canvas";
import { EditorSidebar } from "./canvas/panel/EditorSidebar";
import { ViewModeProvider } from "./canvas/ViewModeContext";
import { ProjectTitle } from "./canvas/ProjectTitle";
import { useEditorSetup } from "./canvas/hooks/useEditorSetup";
import { useAutosave } from "./canvas/hooks/useAutosave";
import { useGenerateAll } from "./canvas/hooks/useGenerateAll";
import { useMetadataSync } from "./canvas/hooks/useMetadataSync";
import { useProjectRehydrate } from "./canvas/hooks/useProjectRehydrate";
import { useScriptSync } from "./canvas/hooks/useScriptSync";
import { useRefineScript } from "./canvas/hooks/useRefineScript";
import { Sparkles, X } from "@/components/ui/icon";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { TopPlayerPanel, SidePlayerPanel } from "./video/PlayerPanel";
import { BottomTransportBar } from "./video/BottomTransportBar";
import {
	PlayerPositionProvider,
	usePlayerPosition,
} from "./video/PlayerPositionContext";
import { ActiveSceneProvider } from "./scene-selection/ActiveSceneContext";
import { AutoScrollProvider } from "./scene-selection/AutoScrollContext";
import { PlayerControlProvider } from "./video/PlayerControlContext";
import { VideoLayoutProvider } from "./video/VideoLayoutContext";
import editorStyles from "./Editor.module.css";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function RefineComposer({
	editor,
	loading,
	onStop,
}: {
	editor: Editor;
	loading: boolean;
	onStop: () => void;
}) {
	const [value, setValue] = useState("");
	const { refineScript, refineLoading, stopRefine } = useRefineScript(editor);
	return (
		<InlineCopilot
			value={value}
			onValueChange={setValue}
			onSubmit={() => {
				refineScript(value);
				setValue("");
			}}
			onStop={refineLoading ? stopRefine : onStop}
			loading={loading || refineLoading}
			placeholder="Refine your script…"
		/>
	);
}

function getGenerateLabel(loading: boolean, generating: boolean): string {
	switch (true) {
		case loading:
			return "Writing…";
		case generating:
			return "Generating…";
		default:
			return "Generate All";
	}
}

function PostPromptViewInner() {
	const { loading, stopGeneration } = useScriptControl();
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

	const { position, visible } = usePlayerPosition();
	const sceneIds = useMemo(
		() => value.filter(isSceneElement).map((scene) => scene.id),
		[value],
	);

	const queue = useGenerationQueue();
	const generating = useQueueSelector((q) => q.isBusy());
	const busy = loading || generating;
	const generateLabel = getGenerateLabel(loading, generating);

	const isTop = position === "top";

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden">
			<div
				aria-hidden
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
			/>
			<div className="fixed top-4 left-4 z-[100]">
				<UserProfile />
			</div>
			<div
				className={`z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-3 pb-2 pl-16 ${editorStyles.copilotEnter}`}
			>
				<div className="flex w-full items-start gap-3">
					<div className="hidden flex-1 sm:block" aria-hidden />
					<div className="min-w-0 max-w-2xl flex-1">
						<RefineComposer
							editor={editor}
							loading={loading}
							onStop={stopGeneration}
						/>
					</div>
					<div className="flex flex-1 items-start justify-end gap-2 max-sm:flex-none">
						<Button
							type="button"
							variant="generate"
							onClick={generateAll}
							className="h-11 shrink-0 px-4 sm:px-5"
							aria-label={generateLabel}
							disabled={busy}
						>
							{busy ? (
								<Spinner className="text-current" />
							) : (
								<Sparkles aria-hidden="true" />
							)}
							<span className="hidden sm:inline">{generateLabel}</span>
						</Button>
						{generating && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										onClick={() => queue.cancelAll()}
										aria-label="Cancel generation"
										className="relative flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-md bg-muted text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground"
									>
										<X className="h-3 w-3" aria-hidden="true" />
									</button>
								</TooltipTrigger>
								<TooltipContent>Cancel generation</TooltipContent>
							</Tooltip>
						)}
					</div>
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
							<ViewModeProvider sceneIds={sceneIds}>
								<div className="flex min-h-0 flex-1 overflow-hidden">
									<EditorSidebar />
									<div className="grain relative mr-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-element-card shadow-elevation-5">
										<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
											{visible && isTop && <TopPlayerPanel />}

											<div className="flex min-h-0 flex-1 overflow-hidden">
												<div
													className="flex-1 overflow-y-auto"
													style={{ scrollbarGutter: "stable" }}
												>
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

											<BottomTransportBar />
										</div>
									</div>
								</div>
							</ViewModeProvider>
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
