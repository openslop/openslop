import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { buildCharacterAvatarPlugins } from "@/lib/connectors/image/plugins/imageChain";
import type {
	GenerationInputs,
	GenerationJob,
	GenerationQueue,
} from "@/lib/generation/queue";
import { getProjectStore } from "./store";

export const CHARACTER_AVATAR_ID_PREFIX = "character-avatar:";

export const characterAvatarElementId = (name: string) =>
	`${CHARACTER_AVATAR_ID_PREFIX}${name}`;

export function characterAvatarInputs(
	name: string,
	appearance: string,
): GenerationInputs {
	return { prompt: name, attributes: { kind: "avatar", appearance } };
}

export function buildCharacterAvatarJob(
	projectId: string,
	name: string,
	registry: ConnectorRegistry,
): GenerationJob {
	const { provider, config } = getDefaultConnector(registry, "image");
	return {
		elementId: characterAvatarElementId(name),
		connectorType: "image",
		provider,
		config: {
			...config,
			plugins: buildCharacterAvatarPlugins(projectId, name),
		},
		prompt: "",
		resolve: () => {
			const appearance =
				getProjectStore(projectId).getState().metadata.characters[name]
					?.appearance ?? "";
			return {
				inputs: characterAvatarInputs(name, appearance),
				extraParams: { projectId },
			};
		},
	};
}

export function ensureCharacterAvatars(
	queue: GenerationQueue,
	projectId: string,
	registry: ConnectorRegistry,
): void {
	const { characters } = getProjectStore(projectId).getState().metadata;
	const jobs: GenerationJob[] = Object.entries(characters)
		.filter(([, ch]) => !ch.avatarUrl && ch.appearance)
		.map(([name]) => buildCharacterAvatarJob(projectId, name, registry));
	queue.enqueueAll(jobs);
}
