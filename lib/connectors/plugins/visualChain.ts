import type { ConnectorPlugin } from "@/lib/connectors/types";
import { createDimensionsPlugin } from "./dimensions";
import { createArtStylePlugin } from "@/lib/connectors/image/plugins/art-style";
import { createCharacterReferencesPlugin } from "@/lib/connectors/image/plugins/character-references";
import { createReferenceImagesPlugin } from "@/lib/connectors/image/plugins/reference-images";

/** What every visual generates with: the project's style, its characters and references, at its aspect. */
export function buildVisualPlugins(type: "image" | "video"): ConnectorPlugin[] {
	return [
		createArtStylePlugin(),
		createCharacterReferencesPlugin(),
		createReferenceImagesPlugin(),
		createDimensionsPlugin(type),
	];
}
