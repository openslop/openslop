"use client";

import {
	useElementHistoryStore,
	useElementHistorySelector,
} from "@/lib/generation/ElementHistoryProvider";
import type { ElementHistoryStatus } from "@/lib/generation/history";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { versionKey, type ElementVersion } from "@/lib/generation/versions";

export type ElementVersionHistory = {
	versions: readonly ElementVersion[];
	status: ElementHistoryStatus;
	activeIndex: number;
};

export function useElementHistory(elementId: string): ElementVersionHistory {
	const versions = useElementHistorySelector((h) => h.get(elementId));
	const status = useElementHistorySelector((h) => h.status(elementId));
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(elementId));
	const activeKey = snapshot.resultInputs
		? versionKey({ inputs: snapshot.resultInputs, pinned: snapshot.pinned })
		: null;

	return {
		versions,
		status,
		activeIndex: versions.findIndex(
			(version) => versionKey(version) === activeKey,
		),
	};
}

export function useLoadElementHistory(): (elementId: string) => void {
	const history = useElementHistoryStore();
	return (elementId) => {
		// A failure shows in the list itself; a toast on top would be noise.
		history
			.load(elementId)
			.catch((err: unknown) =>
				console.error("Failed to read generation history", err),
			);
	};
}
