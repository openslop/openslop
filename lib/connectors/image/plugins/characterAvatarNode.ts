import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import { sourceNode, type NodeSpec } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import {
	characterAvatarElement,
	characterAvatarElementId,
} from "@/lib/project/characterAvatar";
import { getProjectStore } from "@/lib/project/store";
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

/**
 * Record `imageUrl` as a character's avatar. The node is resolved against the
 * store as it is now, so the result is recorded against the inputs it actually
 * describes and does not read as stale the moment it lands.
 */
export function seedCharacterAvatar(
	projectId: string,
	queue: GenerationQueue,
	registry: ConnectorRegistry,
	name: string,
	imageUrl: string,
): void {
	const state = getProjectStore(projectId).getState();
	queue.commitResult(
		nodeBuilder(registry, state)(forCharacterAvatar(name)),
		{ imageUrl, durationSec: 0 },
		{ pinned: true },
	);
}
