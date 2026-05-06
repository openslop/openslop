"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

type ViewModeValue = {
	isCollapsed: (sceneId: string) => boolean;
	hasCollapsed: boolean;
	toggle: (sceneId: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
};

const ViewModeContext = createContext<ViewModeValue>({
	isCollapsed: () => false,
	hasCollapsed: false,
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

	const sceneIdsRef = useRef(sceneIds);
	useEffect(() => {
		sceneIdsRef.current = sceneIds;
	}, [sceneIds]);

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
		setCollapsedScenes(new Set(sceneIdsRef.current));
	}, []);

	const hasCollapsed = collapsedScenes.size > 0;

	const value = useMemo(
		() => ({ isCollapsed, hasCollapsed, toggle, expandAll, collapseAll }),
		[isCollapsed, hasCollapsed, toggle, expandAll, collapseAll],
	);

	return <ViewModeContext value={value}>{children}</ViewModeContext>;
}

export function useViewMode() {
	return useContext(ViewModeContext);
}
