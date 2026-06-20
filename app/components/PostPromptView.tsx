"use client";

import { useMemo } from "react";
import { useScriptInitial } from "@/lib/script/ScriptProvider";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getContentElements, isSceneElement } from "@/lib/canvas/scenes";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { useTransitionType } from "@/lib/video/useTransitionType";
import UserProfile from "./UserProfile";
import { EditorToolbar } from "./EditorToolbar";
import Canvas from "./canvas/Canvas";
import { CanvasProviders } from "./canvas/CanvasProviders";
import { EditorSidebar } from "./canvas/panel/EditorSidebar";
import { ProjectTitle } from "./canvas/ProjectTitle";
import { useEditorSetup } from "./canvas/hooks/useEditorSetup";
import { useAutosave } from "./canvas/hooks/useAutosave";
import { useMetadataSync } from "./canvas/hooks/useMetadataSync";
import { useProjectRehydrate } from "./canvas/hooks/useProjectRehydrate";
import { useScriptSync } from "./canvas/hooks/useScriptSync";
import { TopPlayerPanel, SidePlayerPanel } from "./video/PlayerPanel";
import { BottomTransportBar } from "./video/BottomTransportBar";
import {
	PlayerPositionProvider,
	usePlayerPosition,
} from "./video/PlayerPositionContext";

function PostPromptViewInner() {
	const { editor, value, setValue } = useEditorSetup();
	const { projectId } = useConfig();
	const initialScript = useScriptInitial();
	useProjectRehydrate(editor, initialScript);
	useAutosave(projectId, value);
	useScriptSync(editor);
	useMetadataSync();

	const transitionType = useTransitionType();
	const layoutKey = useMemo(
		() => getLayoutKey(getContentElements(value), transitionType),
		[value, transitionType],
	);
	const sceneIds = useMemo(
		() => value.filter(isSceneElement).map((scene) => scene.id),
		[value],
	);

	const { position, visible } = usePlayerPosition();
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

			<CanvasProviders
				editor={editor}
				layoutKey={layoutKey}
				sceneIds={sceneIds}
			>
				<EditorToolbar editor={editor} />
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
										<Canvas editor={editor} value={value} setValue={setValue} />
									</div>
								</div>

								{visible && !isTop && <SidePlayerPanel />}
							</div>

							<BottomTransportBar />
						</div>
					</div>
				</div>
			</CanvasProviders>
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
