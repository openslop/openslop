"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import type { CanvasElement } from "@/lib/canvas/types";
import { isSceneElement } from "@/lib/canvas/scenes";
import { createRequiredContext } from "@/lib/components/createRequiredContext";

type ViewModeValue = {
	isCollapsed: (sceneId: string) => boolean;
	hasCollapsed: boolean;
	toggle: (sceneId: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
};

const [ViewModeContext, useViewMode] =
	createRequiredContext<ViewModeValue>("ViewModeContext");
export { useViewMode };

export function ViewModeProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const [collapsedScenes, setCollapsedScenes] = useState<Set<string>>(
		() => new Set(),
	);

	const isCollapsed = useCallback(
		(sceneId: string) => collapsedScenes.has(sceneId),
		[collapsedScenes],
	);

	const toggle = useCallback((sceneId: string) => {
		setCollapsedScenes((prev) => {
			const next = new Set(prev);
			if (next.has(sceneId)) next.delete(sceneId);
			else next.add(sceneId);
			return next;
		});
	}, []);

	const expandAll = useCallback(() => {
		setCollapsedScenes(new Set());
	}, []);

	const collapseAll = useCallback(() => {
		const scenes = (editor.children as CanvasElement[]).filter(isSceneElement);
		setCollapsedScenes(new Set(scenes.map((scene) => scene.id)));
	}, [editor]);

	const hasCollapsed = collapsedScenes.size > 0;

	const value = useMemo(
		() => ({ isCollapsed, hasCollapsed, toggle, expandAll, collapseAll }),
		[isCollapsed, hasCollapsed, toggle, expandAll, collapseAll],
	);

	return <ViewModeContext value={value}>{children}</ViewModeContext>;
}
