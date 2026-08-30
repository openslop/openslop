"use client";

import type { ReactNode } from "react";
import { createStoreContext } from "@/lib/store/createStoreContext";
import type { CanvasHistory, CanvasHistoryState } from "./canvasHistory";

const [CanvasHistoryContext, useCanvasHistory, useCanvasHistorySelector] =
	createStoreContext<CanvasHistory>("CanvasHistoryProvider");
export { useCanvasHistory };

export const useCanvasHistoryState = (): CanvasHistoryState =>
	useCanvasHistorySelector((history) => history.getState());

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
