"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createStoreContext } from "@/lib/store/create-store-context";
import { GenerationQueue } from "./queue";
import type { SavedSnapshot } from "./snapshots";

const [GenerationQueueContext, useGenerationQueue, useQueueSelector] =
	createStoreContext<GenerationQueue>("GenerationQueueContext");
export { useGenerationQueue, useQueueSelector };

export function GenerationQueueProvider({
	initialState,
	children,
}: {
	initialState: Record<string, SavedSnapshot>;
	children: ReactNode;
}) {
	const [queue] = useState(() => new GenerationQueue({ initialState }));
	useEffect(() => () => queue.cancelAll(), [queue]);
	return (
		<GenerationQueueContext value={queue}>{children}</GenerationQueueContext>
	);
}
