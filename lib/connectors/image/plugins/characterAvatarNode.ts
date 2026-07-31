import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { sourceNode, type NodeSpec } from "@/lib/generation/graph";
import {
	characterAvatarElement,
	characterAvatarElementId,
} from "@/lib/project/characterAvatar";
import { createArtStylePlugin } from "./art-style";
import { createCharacterAvatarPlugin } from "./character-avatar";
import { createReferenceImagesPlugin } from "./reference-images";

export function buildCharacterAvatarPlugins(name: string): ConnectorPlugin[] {
	return [
		createCharacterAvatarPlugin(name),
		createArtStylePlugin(),
		createReferenceImagesPlugin(),
		createDimensionsPlugin("image"),
	];
}

/**
 * A character with no appearance has nothing to draw from, so its avatar is a
 * leaf the graph never generates rather than a portrait of the bare name. Giving
 * an appearance turns it back into a node that needs generating.
 */
export const forCharacterAvatar =
	(name: string): NodeSpec =>
	(state) =>
		state.metadata.characters[name]?.appearance?.trim()
			? {
					element: characterAvatarElement(state, name),
					plugins: buildCharacterAvatarPlugins(name),
				}
			: sourceNode(characterAvatarElementId(name), {});
