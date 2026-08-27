"use client";

import {
	useEffect,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { ElementHistory, type ElementVersionStorage } from "./history";
import { useGenerationQueue } from "./GenerationQueueProvider";

const [ElementHistoryContext, useElementHistoryStore] =
	createRequiredContext<ElementHistory>("ElementHistoryContext");
export { useElementHistoryStore };

export function useElementHistorySelector<T>(
	selector: (history: ElementHistory) => T,
): T {
	const history = useElementHistoryStore();
	return useSyncExternalStore(
		history.subscribe,
		() => selector(history),
		() => selector(history),
	);
}

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
