import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { buildCharacterAvatarPlugins } from "@/lib/connectors/image/plugins/imageChain";
import type { GenerationJob, GenerationQueue } from "@/lib/generation/queue";
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
			plugins: buildCharacterAvatarPlugins(projectId, name, appearance),
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
		.filter(([, ch]) => {
			if (!ch.appearance) return false;
			if (ch.avatarUploaded) return false; // user-owned upload — never auto-regen
			if (!ch.avatarUrl) return true; // never generated → generate
			// Regenerate only when the appearance that produced the avatar changed.
			// Legacy avatars with no recorded source are left alone until a manual
			// regenerate stamps the source, after which they rejoin this happy path.
			if (ch.avatarSourceAppearance === undefined) return false;
			return ch.appearance !== ch.avatarSourceAppearance;
		})
		.map(([name]) => buildCharacterAvatarJob(projectId, name, registry));
	queue.enqueueAll(jobs);
}
