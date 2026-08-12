"use client";

import {
	useCallback,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import type { Editor } from "slate";
import type { CanvasElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

export type ViewModeStore = {
	isCollapsed: (sceneId: string) => boolean;
	hasCollapsed: () => boolean;
	subscribe: (onChange: () => void) => () => void;
	toggle: (sceneId: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
};

/**
 * Every element card asks whether its scene is collapsed, but a toggle changes
 * the answer for one scene. Holding the collapsed set in the context would
 * re-render all of them; holding a store lets each card subscribe and re-render
 * only when its own scene flips.
 */
export function createViewModeStore(editor: Editor): ViewModeStore {
	let collapsed: ReadonlySet<string> = new Set();
	const listeners = new Set<() => void>();

	const replace = (next: ReadonlySet<string>) => {
		collapsed = next;
		for (const listener of listeners) listener();
	};

	return {
		isCollapsed: (sceneId) => collapsed.has(sceneId),
		hasCollapsed: () => collapsed.size > 0,
		subscribe: (onChange) => {
			listeners.add(onChange);
			return () => {
				listeners.delete(onChange);
			};
		},
		toggle: (sceneId) => {
			const next = new Set(collapsed);
			if (!next.delete(sceneId)) next.add(sceneId);
			replace(next);
		},
		expandAll: () => replace(new Set()),
		collapseAll: () =>
			replace(
				new Set(
					(editor.children as CanvasElement[])
						.filter(isSceneElement)
						.map((scene) => scene.id),
				),
			),
	};
}

const [ViewModeContext, useViewMode] =
	createRequiredContext<ViewModeStore>("ViewModeContext");
export { useViewMode };

const notCollapsed = () => false;

/** Whether `sceneId` is collapsed, re-rendering only when that answer flips. */
export function useIsCollapsed(sceneId: string): boolean {
	const store = useViewMode();
	const getSnapshot = useCallback(
		() => store.isCollapsed(sceneId),
		[store, sceneId],
	);
	return useSyncExternalStore(store.subscribe, getSnapshot, notCollapsed);
}

/** Whether any scene is collapsed, for the expand/collapse-all control. */
export function useHasCollapsed(): boolean {
	const store = useViewMode();
	return useSyncExternalStore(
		store.subscribe,
		store.hasCollapsed,
		notCollapsed,
	);
}

export function ViewModeProvider({
	editor,
	children,
}: {
	editor: Editor;
	children: ReactNode;
}) {
	const [store] = useState(() => createViewModeStore(editor));
	return <ViewModeContext value={store}>{children}</ViewModeContext>;
}
