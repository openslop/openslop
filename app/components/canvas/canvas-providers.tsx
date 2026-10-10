"use client";

import type { ReactNode } from "react";
import { Slate } from "slate-react";
import { composeProviders } from "@/lib/components/compose-providers";
import { LiveGraphProvider } from "@/lib/generation/live-graph-provider";
import { CanvasHistoryProvider } from "@/lib/project/canvas-history-provider";
import { RenderLayoutProvider } from "../player/render-layout-context";
import { BottomViewProvider } from "../player/bottom-view-context";
import { PlayerPlacementProvider } from "../player/player-placement-context";
import { PlayerControlProvider } from "../player/player-control-context";
import { ActiveSceneProvider } from "../scene-selection/active-scene-context";
import { AutoScrollProvider } from "../scene-selection/auto-scroll-context";
import { ViewModeProvider } from "./view-mode-context";
import { ActiveCaptionFont } from "./caption-fonts";
import { SloppyProvider } from "../sloppy/sloppy-provider";
import { EditorPanelProvider } from "./panel/editor-panel-context";
import { AssetEditProvider } from "./elements/character/asset-edit-provider";
import { useEditorSession } from "./hooks/use-editor-session";

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
