import type { CanvasContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { modelRefSchema } from "@/lib/connectors/models";
import { derivedNodeId } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { ElementVersion } from "@/lib/generation/versions";
import type { ProjectData } from "./store";
import type { MetadataCharacter } from "./types";

export const characterAvatarElementId = (name: string) =>
	derivedNodeId("avatar", name);

export const isCharacterAvatarId = (id: string) =>
	id.startsWith(characterAvatarElementId(""));

const avatarSnapshot = (queue: GenerationQueue, name: string) =>
	queue.getElementSnapshot(characterAvatarElementId(name));

/** A character's avatar is whatever its node last produced. */
export const characterAvatarUrl = (queue: GenerationQueue, name: string) =>
	getPrimaryUrl(avatarSnapshot(queue, name).result, "image");

/** The avatar's url only when the user supplied it: a pinned result. */
export function uploadedAvatarUrl(
	queue: GenerationQueue,
	name: string,
): string | undefined {
	const { result, pinned } = avatarSnapshot(queue, name);
	return pinned ? getPrimaryUrl(result, "image") : undefined;
}

export type CharacterAvatarState = "none" | "generated" | "uploaded";

export function characterAvatarState(
	queue: GenerationQueue,
	name: string,
): CharacterAvatarState {
	if (!characterAvatarUrl(queue, name)) return "none";
	return uploadedAvatarUrl(queue, name) ? "uploaded" : "generated";
}

export function characterFromAvatarInputs(
	version: ElementVersion,
): Partial<MetadataCharacter> {
	return {
		appearance: String(version.inputs.attributes.appearance ?? ""),
		avatarModel: modelRefSchema.safeParse(version.inputs.attributes).data,
	};
}

/** Appearance and the picked model ride in the attributes so editing either makes the avatar stale. */
export function characterAvatarElement(
	state: ProjectData,
	name: string,
): CanvasContentElement {
	const id = characterAvatarElementId(name);
	const character = state.metadata.characters[name];
	return {
		id,
		type: "image",
		generationAttributes: {
			kind: "avatar",
			appearance: character?.appearance ?? "",
			...character?.avatarModel,
		},
		children: [{ id: `${id}-t`, type: "image", text: name }],
	};
}
