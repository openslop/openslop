"use client";

import {
	useEffect,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { DEFAULT_BATCH_SIZE, GenerationQueue } from "./queue";
import type { ElementSnapshot } from "./snapshots";

const [GenerationQueueContext, useGenerationQueue] =
	createRequiredContext<GenerationQueue>("GenerationQueueContext");
export { useGenerationQueue };

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
		<GenerationQueueContext value={queue}>{children}</GenerationQueueContext>
	);
}
