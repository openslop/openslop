import type { ConnectorPlugin } from "@/lib/connectors/types";
import { createDimensionsPlugin } from "./dimensions";
import { createArtStylePlugin } from "@/lib/connectors/image/plugins/artStyle";
import { createCharacterReferencesPlugin } from "@/lib/connectors/image/plugins/characterReferences";
import { createReferenceImagesPlugin } from "@/lib/connectors/image/plugins/referenceImages";

export function buildVisualPlugins(type: "image" | "video"): ConnectorPlugin[] {
	return [
		createArtStylePlugin(),
		createCharacterReferencesPlugin(),
		createReferenceImagesPlugin(),
		createDimensionsPlugin(type),
	];
}
