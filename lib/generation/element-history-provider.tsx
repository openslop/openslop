"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createStoreContext } from "@/lib/store/create-store-context";
import { ElementHistory, type ElementVersionStorage } from "./history";
import { useGenerationQueue } from "./generation-queue-provider";

const [
	ElementHistoryContext,
	useElementHistoryStore,
	useElementHistorySelector,
] = createStoreContext<ElementHistory>("ElementHistoryContext");
export { useElementHistoryStore, useElementHistorySelector };

export function ElementHistoryProvider({
	storage,
	children,
}: {
	storage: ElementVersionStorage;
	children: ReactNode;
}) {
	const queue = useGenerationQueue();
	const [history] = useState(() => new ElementHistory(storage));
	useEffect(() => queue.onCommitted(history.record), [queue, history]);
	return (
		<ElementHistoryContext value={history}>{children}</ElementHistoryContext>
	);
}
