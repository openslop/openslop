import { isTemplateAsset } from "@/lib/templates/templates";
import type { ProjectStore } from "./store";
import type { Metadata } from "./types";

export type ProjectStoreSnapshot = {
	metadata: Metadata;
	referenceImages: string[];
	templateReferenceImages: string[];
};

export function extractStoreSnapshot(
	store: ProjectStore,
): ProjectStoreSnapshot {
	const { metadata, referenceImages, templateReferenceImages } =
		store.getState();
	return {
		metadata: structuredClone(metadata),
		referenceImages: [...referenceImages],
		templateReferenceImages: [...templateReferenceImages],
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
	if (snapshot?.templateReferenceImages) {
		state.setTemplateReferenceImages(snapshot.templateReferenceImages);
	} else if (snapshot?.referenceImages) {
		// Old snapshots predate this field — recover it by URL so the next
		// template switch doesn't treat template images as user uploads.
		state.setTemplateReferenceImages(
			snapshot.referenceImages.filter(isTemplateAsset),
		);
	}
	state.markHydrated();
}
