"use client";

import type { ReactNode } from "react";
import type { Editor } from "slate";
import type { AspectRatio } from "@/lib/video/aspectRatio";
import type { TransitionType } from "@/lib/video/transitions";
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
	transitionType,
	aspectRatio,
	sceneIds,
	children,
}: {
	editor: Editor;
	layoutKey: string;
	transitionType: TransitionType;
	aspectRatio: AspectRatio;
	sceneIds: string[];
	children: ReactNode;
}) {
	return (
		<VideoLayoutProvider
			editor={editor}
			layoutKey={layoutKey}
			transitionType={transitionType}
			aspectRatio={aspectRatio}
		>
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
