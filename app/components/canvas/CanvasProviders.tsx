"use client";

import type { ReactNode } from "react";
import type { Descendant } from "slate";
import { Slate } from "slate-react";
import type { CanvasEditor } from "@/lib/canvas/types";
import { VideoLayoutProvider } from "../video/VideoLayoutContext";
import { PlayerControlProvider } from "../video/PlayerControlContext";
import { RenderProvider } from "../video/RenderProvider";
import { ActiveSceneProvider } from "../scene-selection/ActiveSceneContext";
import { AutoScrollProvider } from "../scene-selection/AutoScrollContext";
import { ViewModeProvider } from "./ViewModeContext";
import { ActiveCaptionFont } from "./CaptionFonts";
import { RefineProvider } from "./RefineProvider";

const EMPTY_DOCUMENT: Descendant[] = [];

/**
 * Composes the editor's canvas-scoped providers (document, render, video
 * layout, player control, scene selection, auto-scroll, collapse state) into a
 * single boundary so the top-level view stays a flat orchestrator rather than a
 * provider pyramid. The document lives in `<Slate>`, so consumers subscribe to
 * the slices they need and a keystroke never re-renders the shell.
 */
export function CanvasProviders({
	editor,
	onDocumentChange,
	children,
}: {
	editor: CanvasEditor;
	onDocumentChange: () => void;
	children: ReactNode;
}) {
	return (
		<Slate
			editor={editor}
			initialValue={EMPTY_DOCUMENT}
			onValueChange={onDocumentChange}
		>
			<RenderProvider>
				<ActiveCaptionFont />
				<VideoLayoutProvider editor={editor}>
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
		</Slate>
	);
}
