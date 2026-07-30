import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import type { ConnectorPlugin } from "@/lib/connectors/types";
import type { NodeSpec } from "@/lib/generation/graph";
import { characterAvatarElement } from "@/lib/project/characterAvatar";
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
	});
