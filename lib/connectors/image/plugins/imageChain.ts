import type { ConnectorPlugin } from "@/lib/connectors/types";
import { createDimensionsPlugin } from "@/lib/connectors/plugins/dimensions";
import { createArtStylePlugin } from "./art-style";
import { createCharacterReferencesPlugin } from "./character-references";
import { createReferenceImagesPlugin } from "./reference-images";

/** What every visual generates with: the project's style, its characters and references, at its aspect. */
export function buildVisualPlugins(type: "image" | "video"): ConnectorPlugin[] {
	return [
		createArtStylePlugin(),
		createCharacterReferencesPlugin(),
		createReferenceImagesPlugin(),
		createDimensionsPlugin(type),
	];
}
