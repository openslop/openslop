"use client";

import {
	createContext,
	useCallback,
	useContext,
	useState,
	type ReactNode,
} from "react";

type ViewModeValue = {
	isCollapsed: (sceneId: string) => boolean;
	toggle: (sceneId: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
};

const ViewModeContext = createContext<ViewModeValue>({
	isCollapsed: () => false,
	toggle: () => {},
	expandAll: () => {},
	collapseAll: () => {},
});

export function ViewModeProvider({
	sceneIds,
	children,
}: {
	sceneIds: string[];
	children: ReactNode;
}) {
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
		setCollapsedScenes(new Set(sceneIds));
	}, [sceneIds]);

	return (
		<ViewModeContext value={{ isCollapsed, toggle, expandAll, collapseAll }}>
			{children}
		</ViewModeContext>
	);
}

export function useViewMode() {
	return useContext(ViewModeContext);
}
