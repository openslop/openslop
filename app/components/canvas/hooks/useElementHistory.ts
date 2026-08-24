"use client";

import {
	useElementHistoryStore,
	useHistorySelector,
} from "@/lib/generation/ElementHistoryProvider";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { versionKey, type ElementVersion } from "@/lib/generation/versions";

export type VersionHistory = {
	versions: readonly ElementVersion[];
	loaded: boolean;
	failed: boolean;
	activeIndex: number;
};

/** An element's versions and which one it is showing. */
export function useElementHistory(elementId: string): VersionHistory {
	const versions = useHistorySelector((h) => h.get(elementId));
	const loaded = useHistorySelector((h) => h.isLoaded(elementId));
	const failed = useHistorySelector((h) => h.isFailed(elementId));
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(elementId));
	const activeKey = snapshot.resultInputs
		? versionKey({ inputs: snapshot.resultInputs, pinned: snapshot.pinned })
		: null;

	return {
		versions,
		loaded,
		failed,
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
