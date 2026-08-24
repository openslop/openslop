"use client";

import {
	useElementHistoryStore,
	useHistorySelector,
} from "@/lib/generation/ElementHistoryProvider";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { serializeInputs } from "@/lib/generation/inputs";
import type { ElementVersion } from "@/lib/generation/versions";

export type VersionHistory = {
	versions: readonly ElementVersion[];
	loaded: boolean;
	failed: boolean;
	activeIndex: number;
};

/**
 * An element's takes and which one it is showing. A take is identified by its
 * inputs, so the shown take is the one whose inputs produced the live result.
 */
export function useElementHistory(elementId: string): VersionHistory {
	const versions = useHistorySelector((h) => h.get(elementId));
	const loaded = useHistorySelector((h) => h.isLoaded(elementId));
	const failed = useHistorySelector((h) => h.isFailed(elementId));
	const activeInputs = useQueueSelector(
		(q) => q.getElementSnapshot(elementId).resultInputs,
	);
	const activeKey = activeInputs ? serializeInputs(activeInputs) : null;

	return {
		versions,
		loaded,
		failed,
		activeIndex: versions.findIndex(
			(version) => serializeInputs(version.inputs) === activeKey,
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
