import { z } from "zod";
import { ASPECT_RATIOS } from "@/lib/video/aspectRatio";
import { TRANSITION_TYPES } from "@/lib/video/transitions";
import type { ProjectStore } from "./store";
import {
	MetadataCharacterSchema,
	MetadataVoiceSchema,
	MODES,
	type Metadata,
} from "./types";

const VideoSettingsSchema = z.object({
	transitionType: z.enum(TRANSITION_TYPES).optional(),
	aspectRatio: z.enum(ASPECT_RATIOS).optional(),
});

const MetadataSchema: z.ZodType<Metadata, unknown> = z.object({
	title: z.string().default(""),
	style: z.string().default(""),
	narration: MetadataVoiceSchema.default({}),
	characters: z.record(z.string(), MetadataCharacterSchema).default({}),
	videoSettings: VideoSettingsSchema.optional(),
	lastMode: z.enum(MODES).optional(),
	lastPrompt: z.string().optional(),
});

const ProjectStoreSnapshotSchema = z.object({
	metadata: z.preprocess((value) => value ?? {}, MetadataSchema),
	referenceImages: z.array(z.string()).default([]),
});

export type ProjectStoreSnapshot = z.infer<typeof ProjectStoreSnapshotSchema>;

export function extractStoreSnapshot(
	store: ProjectStore,
): ProjectStoreSnapshot {
	const { metadata, referenceImages } = store.getState();
	return {
		metadata: structuredClone(metadata),
		referenceImages: [...referenceImages],
	};
}

/**
 * The `store` column is untyped JSON. Parse it into a complete snapshot once
 * here so callers can trust the types; a structurally wrong row throws.
 */
export function parseStoreSnapshot(raw: unknown): ProjectStoreSnapshot {
	return ProjectStoreSnapshotSchema.parse(raw ?? {});
}

export function applyStoreSnapshot(
	store: ProjectStore,
	snapshot: ProjectStoreSnapshot,
): void {
	const state = store.getState();
	if (state.hydrated) return;
	state.updateMetadata(snapshot.metadata);
	state.setReferenceImages(snapshot.referenceImages);
	state.markHydrated();
}
