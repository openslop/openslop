"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createStoreContext } from "@/lib/store/create-store-context";
import { ElementHistory, type ElementVersionStorage } from "./history";
import { GenerationQueue } from "./queue";
import type { ElementSnapshot } from "./snapshots";

const [GenerationQueueContext, useGenerationQueue, useQueueSelector] =
	createStoreContext<GenerationQueue>("GenerationQueueContext");
const [
	ElementHistoryContext,
	useElementHistoryStore,
	useElementHistorySelector,
] = createStoreContext<ElementHistory>("ElementHistoryContext");
export {
	useGenerationQueue,
	useQueueSelector,
	useElementHistoryStore,
	useElementHistorySelector,
};

export function GenerationQueueProvider({
	initialState,
	storage,
	children,
}: {
	initialState: Record<string, ElementSnapshot>;
	storage: ElementVersionStorage;
	children: ReactNode;
}) {
	const [{ queue, history }] = useState(() => {
		const history = new ElementHistory(storage);
		const queue = new GenerationQueue({ initialState });
		queue.onCommitted(history.record);
		return { queue, history };
	});
	useEffect(() => () => queue.cancelAll(), [queue]);
	return (
		<GenerationQueueContext value={queue}>
			<ElementHistoryContext value={history}>{children}</ElementHistoryContext>
		</GenerationQueueContext>
	);
}
