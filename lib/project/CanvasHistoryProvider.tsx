"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import type { CanvasHistory, CanvasHistoryState } from "./canvasHistory";

const [CanvasHistoryContext, useCanvasHistory] =
	createRequiredContext<CanvasHistory>("CanvasHistoryProvider");
export { useCanvasHistory };

export function useCanvasHistoryState(): CanvasHistoryState {
	const history = useCanvasHistory();
	return useSyncExternalStore(
		history.subscribe,
		history.getState,
		history.getState,
	);
}

export function CanvasHistoryProvider({
	history,
	children,
}: {
	history: CanvasHistory;
	children: ReactNode;
}) {
	return (
		<CanvasHistoryContext value={history}>{children}</CanvasHistoryContext>
	);
}
