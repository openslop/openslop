import type { CanvasContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { DEFAULT_PROVIDER } from "@/lib/connectors/registry";
import { derivedNodeId, type NodeResults } from "@/lib/generation/graph";
import type { ProjectData } from "@/lib/project/store";

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
		customAttributes: {
			kind: "avatar",
			appearance,
			provider: DEFAULT_PROVIDER,
		},
		children: [{ id: `${id}-t`, type: "image", text: name }],
	};
}
