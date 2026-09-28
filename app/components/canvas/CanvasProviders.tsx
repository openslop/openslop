"use client";

import type { ReactNode } from "react";
import type { Descendant } from "slate";
import { Slate } from "slate-react";
import { composeProviders } from "@/lib/components/composeProviders";
import { CanvasHistoryProvider } from "@/lib/project/CanvasHistoryProvider";
import { RenderLayoutProvider } from "../player/RenderLayoutContext";
import { BottomViewProvider } from "../player/BottomViewContext";
import { PlayerPlacementProvider } from "../player/PlayerPlacementContext";
import { PlayerControlProvider } from "../player/PlayerControlContext";
import { RenderProvider } from "../player/RenderProvider";
import { ActiveSceneProvider } from "../scene-selection/ActiveSceneContext";
import { AutoScrollProvider } from "../scene-selection/AutoScrollContext";
import { ViewModeProvider } from "./ViewModeContext";
import { ActiveCaptionFont } from "./CaptionFonts";
import { SloppyProvider } from "../sloppy/SloppyProvider";
import { EditorPanelProvider } from "./panel/EditorPanelContext";
import { useEditorSession } from "./hooks/useEditorSession";

const EMPTY_DOCUMENT: Descendant[] = [];

const CanvasScopedProviders = composeProviders(
	RenderProvider,
	RenderLayoutProvider,
	PlayerPlacementProvider,
	BottomViewProvider,
	PlayerControlProvider,
	ActiveSceneProvider,
	AutoScrollProvider,
	ViewModeProvider,
	SloppyProvider,
	EditorPanelProvider,
);

/**
 * Opens the editor session and composes every canvas-scoped provider (document,
 * version history, render, video layout, player placement and control, bottom
 * view, scene selection, auto-scroll, collapse state) into a single boundary,
 * so the top-level view stays a flat orchestrator. The document lives
 * in `<Slate>`, so consumers subscribe to the slices they need and a keystroke
 * never re-renders the shell, and they reach the editor itself with
 * `useSlateStatic()` rather than a drilled prop.
 */
export function CanvasProviders({ children }: { children: ReactNode }) {
	const { editor, onDocumentChange, history } = useEditorSession();

	return (
		<Slate
			editor={editor}
			initialValue={EMPTY_DOCUMENT}
			onValueChange={onDocumentChange}
		>
			<CanvasHistoryProvider history={history}>
				<CanvasScopedProviders>
					<ActiveCaptionFont />
					{children}
				</CanvasScopedProviders>
			</CanvasHistoryProvider>
		</Slate>
	);
}
