"use client";

import type { ReactNode } from "react";
import type { Editor } from "slate";
import { VideoLayoutProvider } from "../video/VideoLayoutContext";
import { PlayerControlProvider } from "../video/PlayerControlContext";
import { RenderProvider } from "../video/RenderProvider";
import { ActiveSceneProvider } from "../scene-selection/ActiveSceneContext";
import { AutoScrollProvider } from "../scene-selection/AutoScrollContext";
import { ViewModeProvider } from "./ViewModeContext";
import { ActiveCaptionFont } from "./CaptionFonts";
import { RefineProvider } from "./RefineProvider";

/**
 * Composes the editor's canvas-scoped providers (render, video layout, player
 * control, scene selection, auto-scroll, collapse state) into a single boundary
 * so the top-level view stays a flat orchestrator rather than a provider pyramid.
 */
export function CanvasProviders({
	editor,
	layoutKey,
	children,
}: {
	editor: Editor;
	layoutKey: string;
	children: ReactNode;
}) {
	return (
		<RenderProvider>
			<ActiveCaptionFont />
			<VideoLayoutProvider editor={editor} layoutKey={layoutKey}>
				<PlayerControlProvider>
					<ActiveSceneProvider>
						<AutoScrollProvider>
							<ViewModeProvider editor={editor}>
								<RefineProvider editor={editor}>{children}</RefineProvider>
							</ViewModeProvider>
						</AutoScrollProvider>
					</ActiveSceneProvider>
				</PlayerControlProvider>
			</VideoLayoutProvider>
		</RenderProvider>
	);
}
