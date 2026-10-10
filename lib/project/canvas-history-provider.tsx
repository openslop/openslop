"use client";

import type { ReactNode } from "react";
import { createStoreContext } from "@/lib/store/create-store-context";
import type { CanvasHistory, CanvasHistoryState } from "./canvas-history";

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
