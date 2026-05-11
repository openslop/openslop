"use client";

import {
	createContext,
	use,
	useEffect,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import {
	DEFAULT_BATCH_SIZE,
	GenerationQueue,
	type ElementSnapshot,
} from "./queue";

const GenerationQueueContext = createContext<GenerationQueue | null>(null);

export function useGenerationQueue(): GenerationQueue {
	const queue = use(GenerationQueueContext);
	if (!queue) {
		throw new Error(
			"useGenerationQueue must be used within a GenerationQueueProvider",
		);
	}
	return queue;
}

export function useQueueSelector<T>(
	selector: (queue: GenerationQueue) => T,
): T {
	const queue = useGenerationQueue();
	return useSyncExternalStore(
		queue.subscribe,
		() => selector(queue),
		() => selector(queue),
	);
}

export function GenerationQueueProvider({
	initialState,
	children,
}: {
	initialState: Record<string, ElementSnapshot>;
	children: ReactNode;
}) {
	const [queue] = useState(
		() =>
			new GenerationQueue({
				batchSize: DEFAULT_BATCH_SIZE,
				initialState,
			}),
	);
	useEffect(() => () => queue.cancelAll(), [queue]);
	return (
		<GenerationQueueContext.Provider value={queue}>
			{children}
		</GenerationQueueContext.Provider>
	);
}
