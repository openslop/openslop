"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useGenerationQueue } from "./GenerationQueueProvider";
import type { GenerationQueue } from "./queue";

/**
 * A value derived from generation state as a whole: what the queue has settled
 * plus the project state nodes are built from. Derive a primitive, and the
 * subscriber re-renders when that value changes rather than on every write to
 * either store.
 */
export function useGenerationValue<T extends string | number | boolean | null>(
	derive: (queue: GenerationQueue) => T,
): T {
	const queue = useGenerationQueue();
	const store = useProjectStoreHandle();
	const subscribe = useCallback(
		(onChange: () => void) => {
			const stop = [queue.subscribe(onChange), store.subscribe(onChange)];
			return () => {
				for (const off of stop) off();
			};
		},
		[queue, store],
	);
	const read = () => derive(queue);
	return useSyncExternalStore(subscribe, read, read);
}
