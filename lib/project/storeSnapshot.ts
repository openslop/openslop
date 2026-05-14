import type { ProjectStore } from "./store";
import type { Metadata } from "./types";

export type ProjectStoreSnapshot = {
	metadata: Metadata;
	referenceImages: string[];
};

export function extractStoreSnapshot(
	store: ProjectStore,
): ProjectStoreSnapshot {
	const { metadata, referenceImages } = store.getState();
	return {
		metadata: structuredClone(metadata),
		referenceImages: [...referenceImages],
	};
}

export function applyStoreSnapshot(
	store: ProjectStore,
	snapshot: Partial<ProjectStoreSnapshot> | null | undefined,
): void {
	const state = store.getState();
	if (state.hydrated) return;
	if (snapshot?.metadata) state.updateMetadata(snapshot.metadata);
	if (snapshot?.referenceImages)
		state.setReferenceImages(snapshot.referenceImages);
	state.markHydrated();
}
