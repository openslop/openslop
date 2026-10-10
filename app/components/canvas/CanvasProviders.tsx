"use client";

import type { ReactNode } from "react";
import { Slate } from "slate-react";
import { composeProviders } from "@/lib/components/composeProviders";
import { LiveGraphProvider } from "@/lib/generation/LiveGraphProvider";
import { CanvasHistoryProvider } from "@/lib/project/CanvasHistoryProvider";
import { RenderLayoutProvider } from "../player/RenderLayoutContext";
import { BottomViewProvider } from "../player/BottomViewContext";
import { PlayerPlacementProvider } from "../player/PlayerPlacementContext";
import { PlayerControlProvider } from "../player/PlayerControlContext";
import { ActiveSceneProvider } from "../scene-selection/ActiveSceneContext";
import { AutoScrollProvider } from "../scene-selection/AutoScrollContext";
import { ViewModeProvider } from "./ViewModeContext";
import { ActiveCaptionFont } from "./CaptionFonts";
import { SloppyProvider } from "../sloppy/SloppyProvider";
import { EditorPanelProvider } from "./panel/EditorPanelContext";
import { AssetEditProvider } from "./elements/character/AssetEditProvider";
import { useEditorSession } from "./hooks/useEditorSession";

const CanvasScopedProviders = composeProviders(
	LiveGraphProvider,
	RenderLayoutProvider,
	PlayerPlacementProvider,
	BottomViewProvider,
	PlayerControlProvider,
	ActiveSceneProvider,
	AutoScrollProvider,
	ViewModeProvider,
	SloppyProvider,
	EditorPanelProvider,
	AssetEditProvider,
);

/**
 * Opens the editor session and composes every canvas-scoped provider (document,
 * version history, video layout, player placement and control, bottom
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
			initialValue={editor.children}
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
