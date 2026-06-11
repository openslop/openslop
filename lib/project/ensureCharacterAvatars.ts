import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { buildCharacterAvatarPlugins } from "@/lib/connectors/image/plugins/imageChain";
import type { GenerationJob, GenerationQueue } from "@/lib/generation/queue";
import { avatarInputsSignature } from "./avatarInputs";
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
	const { metadata, referenceImages } = getProjectStore(projectId).getState();
	const appearance = metadata.characters[name]?.appearance ?? "";
	const signature = avatarInputsSignature(
		appearance,
		metadata.style,
		referenceImages,
	);
	return {
		elementId: characterAvatarElementId(name),
		connectorType: "image",
		provider,
		config: {
			...config,
			plugins: buildCharacterAvatarPlugins(
				projectId,
				name,
				appearance,
				signature,
			),
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
	const { metadata, referenceImages } = getProjectStore(projectId).getState();
	const jobs: GenerationJob[] = Object.entries(metadata.characters)
		.filter(([, ch]) => {
			if (!ch.appearance) return false;
			if (ch.avatarUploaded) return false; // user-owned upload — never auto-regen
			if (!ch.avatarUrl) return true; // never generated → generate
			// Regenerate when any input that drives avatar generation changed
			// (appearance, art style, or reference images), compared via the
			// persisted signature so it survives reloads. Legacy avatars with no
			// recorded signature are left alone until a manual regenerate stamps
			// one, after which they rejoin this happy path.
			if (ch.avatarInputsSignature === undefined) return false;
			return (
				ch.avatarInputsSignature !==
				avatarInputsSignature(ch.appearance, metadata.style, referenceImages)
			);
		})
		.map(([name]) => buildCharacterAvatarJob(projectId, name, registry));
	queue.enqueueAll(jobs);
}
