"use client";

import {
	useElementHistoryStore,
	useElementHistorySelector,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import type { ElementHistoryStatus } from "@/lib/generation/history";
import {
	activeVersionIndex,
	type ElementVersion,
} from "@/lib/generation/versions";

export type ElementVersionHistory = {
	versions: readonly ElementVersion[];
	status: ElementHistoryStatus;
	activeIndex: number;
};

export function useElementHistory(elementId: string): ElementVersionHistory {
	const versions = useElementHistorySelector((h) => h.get(elementId));
	const status = useElementHistorySelector((h) => h.status(elementId));
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(elementId));
	return {
		versions,
		status,
		activeIndex: activeVersionIndex(versions, snapshot),
	};
}

export function useLoadElementHistory(): (elementId: string) => void {
	const history = useElementHistoryStore();
	return (elementId) => {
		// A failure shows in the list itself; a toast on top would be noise.
		history
			.load(elementId)
			.catch((error: unknown) =>
				console.error("Failed to read generation history", error),
			);
	};
}
