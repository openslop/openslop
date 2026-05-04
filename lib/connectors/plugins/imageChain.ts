import type { ConnectorPlugin } from "../types";
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
): ConnectorPlugin[] {
	return [
		createCharacterAvatarPlugin(projectId, characterName),
		createArtStylePlugin(projectId),
	];
}
