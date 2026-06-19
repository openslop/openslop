"use client";

import type { ReactNode } from "react";
import type { Editor } from "slate";
import { VideoLayoutProvider } from "../video/VideoLayoutContext";
import { PlayerControlProvider } from "../video/PlayerControlContext";
import { ActiveSceneProvider } from "../scene-selection/ActiveSceneContext";
import { AutoScrollProvider } from "../scene-selection/AutoScrollContext";
import { ViewModeProvider } from "./ViewModeContext";

/**
 * Composes the editor's canvas-scoped providers (video layout, player control,
 * scene selection, auto-scroll, collapse state) into a single boundary so the
 * top-level view stays a flat orchestrator rather than a provider pyramid.
 */
export function CanvasProviders({
	editor,
	layoutKey,
	sceneIds,
	children,
}: {
	editor: Editor;
	layoutKey: string;
	sceneIds: string[];
	children: ReactNode;
}) {
	return (
		<VideoLayoutProvider editor={editor} layoutKey={layoutKey}>
			<PlayerControlProvider>
				<ActiveSceneProvider>
					<AutoScrollProvider>
						<ViewModeProvider sceneIds={sceneIds}>{children}</ViewModeProvider>
					</AutoScrollProvider>
				</ActiveSceneProvider>
			</PlayerControlProvider>
		</VideoLayoutProvider>
	);
}
