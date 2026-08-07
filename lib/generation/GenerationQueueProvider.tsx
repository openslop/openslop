"use client";

import {
	useEffect,
	useState,
	useSyncExternalStore,
	type ReactNode,
} from "react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { GenerationQueue } from "./queue";
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
	const [queue] = useState(() => new GenerationQueue({ initialState }));
	useEffect(() => () => queue.cancelAll(), [queue]);
	return (
		<GenerationQueueContext value={queue}>{children}</GenerationQueueContext>
	);
}
