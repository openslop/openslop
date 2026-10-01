"use client";

import { useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { isSceneElement } from "@/lib/canvas/scenes";
import { createStoreContext } from "@/lib/store/createStoreContext";
import { createEmitter, type Emitter } from "@/lib/store/emitter";

type ViewModeActions = {
	toggle: (sceneId: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
};

export type ViewModeStore = ViewModeActions & {
	isCollapsed: (sceneId: string) => boolean;
	hasCollapsed: () => boolean;
	subscribe: Emitter["subscribe"];
};

/**
 * Every scene and every element card asks whether its scene is collapsed.
 * Holding the collapsed set in the context would re-render all of them when one
 * scene folds; holding a store re-renders only that scene and its cards.
 */
export function createViewModeStore(sceneIds: () => string[]): ViewModeStore {
	const { subscribe, notify } = createEmitter();
	let collapsed = new Set<string>();
	const setCollapsed = (next: Set<string>) => {
		collapsed = next;
		notify();
	};
	return {
		isCollapsed: (sceneId) => collapsed.has(sceneId),
		hasCollapsed: () => collapsed.size > 0,
		toggle: (sceneId) => {
			const next = new Set(collapsed);
			if (!next.delete(sceneId)) next.add(sceneId);
			setCollapsed(next);
		},
		expandAll: () => setCollapsed(new Set()),
		collapseAll: () => setCollapsed(new Set(sceneIds())),
		subscribe,
	};
}

const [ViewModeContext, useViewModeStore, useViewModeSelector] =
	createStoreContext<ViewModeStore>("ViewModeContext");

/** Only the actions: what is collapsed is read through the hooks below, which subscribe. */
export const useViewMode: () => ViewModeActions = useViewModeStore;

export function useSceneCollapsed(sceneId: string): boolean {
	return useViewModeSelector((mode) => mode.isCollapsed(sceneId));
}

export function useHasCollapsed(): boolean {
	return useViewModeSelector((mode) => mode.hasCollapsed());
}

export function ViewModeProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const [store] = useState(() =>
		createViewModeStore(() =>
			editor.children.filter(isSceneElement).map((scene) => scene.id),
		),
	);
	return <ViewModeContext value={store}>{children}</ViewModeContext>;
}
