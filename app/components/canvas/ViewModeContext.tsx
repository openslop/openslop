"use client";

import { useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { createStore, type StoreApi } from "zustand/vanilla";
import { isScene } from "@/lib/canvas/scenes";
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

// A store, not a context value, so folding one scene re-renders only that scene.
const [ViewModeContext, useViewModeStore, useViewModeSelector] =
	createStoreContext<StoreApi<ViewMode>>("ViewModeContext");

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
			editor.children.filter(isScene).map((scene) => scene.id),
		),
	);
	return <ViewModeContext value={store}>{children}</ViewModeContext>;
}
