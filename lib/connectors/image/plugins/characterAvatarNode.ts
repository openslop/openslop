import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import type { NodeSpec } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import { nodeBuilder } from "@/lib/generation/resolveGraph";
import { characterAvatarElement } from "@/lib/project/characterAvatar";
import type { ProjectContext } from "@/lib/project/store";
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

export const forCharacterAvatar =
	(name: string): NodeSpec =>
	(state) => ({
		element: characterAvatarElement(state, name),
		plugins: buildCharacterAvatarPlugins(name),
		label: `${name}'s avatar`,
	});

/**
 * Record `imageUrl` as a character's avatar. The node is resolved against the
 * store as it is now, so the result is recorded against the inputs it actually
 * describes and does not read as stale the moment it lands.
 */
export function seedCharacterAvatar(
	state: ProjectContext,
	queue: GenerationQueue,
	registry: ConnectorRegistry,
	name: string,
	imageUrl: string,
): void {
	queue.commitResult(
		nodeBuilder(registry, state)(forCharacterAvatar(name)),
		{ imageUrl, durationSec: 0 },
		{ pinned: true },
	);
}
