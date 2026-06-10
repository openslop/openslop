import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { buildCharacterAvatarPlugins } from "@/lib/connectors/image/plugins/imageChain";
import {
	isStaleResult,
	type GenerationJob,
	type GenerationQueue,
} from "@/lib/generation/queue";
import { getGenerationInputs } from "@/lib/generation/getGenerationInputs";
import { getProjectStore } from "./store";

export const CHARACTER_AVATAR_ID_PREFIX = "character-avatar:";

export const characterAvatarElementId = (name: string) =>
	`${CHARACTER_AVATAR_ID_PREFIX}${name}`;

export function characterAvatarElement(
	name: string,
	appearance: string,
): CanvasContentElement {
	const id = characterAvatarElementId(name);
	return {
		id,
		type: "image",
		customAttributes: { kind: "avatar", appearance },
		children: [{ id: `${id}-t`, type: "image", text: name }],
	};
}

export function buildCharacterAvatarJob(
	projectId: string,
	name: string,
	registry: ConnectorRegistry,
): GenerationJob {
	const { provider, config } = getDefaultConnector(registry, "image");
	const appearance =
		getProjectStore(projectId).getState().metadata.characters[name]
			?.appearance ?? "";
	return {
		elementId: characterAvatarElementId(name),
		connectorType: "image",
		provider,
		config: {
			...config,
			plugins: buildCharacterAvatarPlugins(projectId, name),
		},
		projectId,
		element: characterAvatarElement(name, appearance),
	};
}

export function ensureCharacterAvatars(
	queue: GenerationQueue,
	projectId: string,
	registry: ConnectorRegistry,
): void {
	const { metadata } = getProjectStore(projectId).getState();
	const jobs: GenerationJob[] = Object.entries(metadata.characters)
		.filter(([name, ch]) => {
			if (!ch.appearance) return false;
			if (!ch.avatarUrl) return true; // never generated → generate
			// Regenerate when the appearance that produced the avatar changed.
			// Guard the cold case: if the queue has no memory of the inputs that
			// produced this avatar (no resultInputs), keep the existing one rather
			// than blindly respending credits.
			const snapshot = queue.getElementSnapshot(characterAvatarElementId(name));
			if (!snapshot.resultInputs) return false;
			const inputs = getGenerationInputs(
				characterAvatarElement(name, ch.appearance),
				metadata,
			);
			return isStaleResult(snapshot, inputs);
		})
		.map(([name]) => buildCharacterAvatarJob(projectId, name, registry));
	queue.enqueueAll(jobs);
}
