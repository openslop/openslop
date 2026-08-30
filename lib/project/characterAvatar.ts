import type { CanvasContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { derivedNodeId, type NodeResults } from "@/lib/generation/graph";
import type { ElementVersion } from "@/lib/generation/versions";
import type { ProjectData } from "@/lib/project/store";
import type { MetadataCharacter } from "@/lib/project/types";

export const characterAvatarElementId = (name: string) =>
	derivedNodeId("avatar", name);

export const isCharacterAvatarId = (id: string) =>
	id.startsWith(characterAvatarElementId(""));

/** A character's avatar is whatever its node last produced. */
export const characterAvatarUrl = (results: NodeResults, name: string) =>
	getPrimaryUrl(
		results.getElementSnapshot(characterAvatarElementId(name)).result,
		"image",
	);

export type CharacterAvatarState = "none" | "generated" | "uploaded";

/** The uploaded flag only means something once an avatar image exists. */
export function characterAvatarState(
	results: NodeResults,
	name: string,
	uploaded: boolean | undefined,
): CharacterAvatarState {
	if (!characterAvatarUrl(results, name)) return "none";
	return uploaded ? "uploaded" : "generated";
}

export function characterFromAvatarInputs(
	version: ElementVersion,
): Partial<MetadataCharacter> {
	return {
		appearance: String(version.inputs.attributes.appearance ?? ""),
		avatarUploaded: version.pinned,
	};
}

/** Appearance rides in the attributes so editing it makes the avatar stale. */
export function characterAvatarElement(
	state: ProjectData,
	name: string,
): CanvasContentElement {
	const id = characterAvatarElementId(name);
	const appearance = state.metadata.characters[name]?.appearance ?? "";
	return {
		id,
		type: "image",
		generationAttributes: { kind: "avatar", appearance },
		children: [{ id: `${id}-t`, type: "image", text: name }],
	};
}
