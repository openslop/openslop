import { backfillAvatarSignatures } from "./avatarInputs";
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

	// Backfill input signatures for avatars generated before signatures existed,
	// so staleness detection (and its UI) works for them on the next edit instead
	// of staying invisible until a manual regenerate.
	const { metadata, referenceImages } = store.getState();
	const stamped = backfillAvatarSignatures(
		metadata.characters,
		metadata.style,
		referenceImages,
	);
	for (const [name, signature] of Object.entries(stamped)) {
		state.setCharacter(name, {
			...metadata.characters[name],
			avatarInputsSignature: signature,
		});
	}

	state.markHydrated();
}
