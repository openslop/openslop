import type { ConnectorPlugin } from "@/lib/connectors/types";
import { createArtStylePlugin } from "./art-style";
import { createCharacterAvatarPlugin } from "./character-avatar";
import { createCharacterReferencesPlugin } from "./character-references";
import { createReferenceImagesPlugin } from "./reference-images";

export function buildImagePlugins(projectId: string): ConnectorPlugin[] {
	return [
		createArtStylePlugin(projectId),
		createCharacterReferencesPlugin(projectId),
		createReferenceImagesPlugin(projectId),
	];
}

export function buildCharacterAvatarPlugins(
	projectId: string,
	characterName: string,
	appearance: string,
	inputsSignature: string,
): ConnectorPlugin[] {
	return [
		createCharacterAvatarPlugin(
			projectId,
			characterName,
			appearance,
			inputsSignature,
		),
		createArtStylePlugin(projectId),
		createReferenceImagesPlugin(projectId),
	];
}
