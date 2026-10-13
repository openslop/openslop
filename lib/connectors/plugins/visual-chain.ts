import type { ConnectorPlugin } from "@/lib/connectors/types";
import { createDimensionsPlugin } from "./dimensions";
import { createArtStylePlugin } from "@/lib/connectors/image/plugins/art-style";
import { createCharacterAssetsPlugin } from "./character-assets";
import { createReferenceImagesPlugin } from "@/lib/connectors/image/plugins/reference-images";

export function buildVisualPlugins(type: "image" | "video"): ConnectorPlugin[] {
	return [
		createArtStylePlugin(),
		createCharacterAssetsPlugin({ voices: type === "video" }),
		createReferenceImagesPlugin(),
		createDimensionsPlugin(type),
	];
}
