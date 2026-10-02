"use client";

import { useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { createStore, type StoreApi } from "zustand/vanilla";
import { isSceneElement } from "@/lib/canvas/scenes";
import { createStoreContext } from "@/lib/store/createStoreContext";

type ViewMode = {
	collapsed: ReadonlySet<string>;
	toggle: (sceneId: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
};

export function createViewModeStore(
	sceneIds: () => string[],
): StoreApi<ViewMode> {
	return createStore<ViewMode>()((set) => ({
		collapsed: new Set(),
		toggle: (sceneId) =>
			set(({ collapsed }) => {
				const next = new Set(collapsed);
				if (!next.delete(sceneId)) next.add(sceneId);
				return { collapsed: next };
			}),
		expandAll: () => set({ collapsed: new Set() }),
		collapseAll: () => set({ collapsed: new Set(sceneIds()) }),
	}));
}

/**
 * Every scene and every element card asks whether its scene is collapsed.
 * Holding the collapsed set in the context would re-render all of them when one
 * scene folds; holding a store re-renders only that scene and its cards.
 */
const [ViewModeContext, useViewModeStore, useViewModeSelector] =
	createStoreContext<StoreApi<ViewMode>>("ViewModeContext");

/** Only the actions, which never change: what is collapsed is read through the hooks below, which subscribe. */
export function useViewMode(): Omit<ViewMode, "collapsed"> {
	return useViewModeStore().getState();
}

export function useSceneCollapsed(sceneId: string): boolean {
	return useViewModeSelector((store) =>
		store.getState().collapsed.has(sceneId),
	);
}

export function useHasCollapsed(): boolean {
	return useViewModeSelector((store) => store.getState().collapsed.size > 0);
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
