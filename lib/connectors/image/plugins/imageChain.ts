import type { ConnectorPlugin } from "@/lib/connectors/types";
import { createDimensionsPlugin } from "../../plugins/dimensions";
import { createArtStylePlugin } from "./art-style";
import { createCharacterReferencesPlugin } from "./character-references";
import { createReferenceImagesPlugin } from "./reference-images";

export function buildImagePlugins(): ConnectorPlugin[] {
	return [
		createArtStylePlugin(),
		createCharacterReferencesPlugin(),
		createReferenceImagesPlugin(),
		createDimensionsPlugin("image"),
	];
}
