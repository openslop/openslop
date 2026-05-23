import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { buildCharacterAvatarPlugins } from "@/lib/connectors/image/plugins/imageChain";
import type { GenerationJob, GenerationQueue } from "@/lib/generation/queue";
import { getProjectStore } from "./store";

export const CHARACTER_AVATAR_ID_PREFIX = "character-avatar:";

export const characterAvatarElementId = (name: string) =>
	`${CHARACTER_AVATAR_ID_PREFIX}${name}`;

export function ensureCharacterAvatars(
	queue: GenerationQueue,
	projectId: string,
	registry: ConnectorRegistry,
): void {
	const { characters } = getProjectStore(projectId).getState().metadata;
	const { provider, config } = getDefaultConnector(registry, "image");

	const jobs: GenerationJob[] = Object.entries(characters)
		.filter(([, ch]) => !ch.avatarUrl && ch.appearance)
		.map(([name]) => ({
			elementId: characterAvatarElementId(name),
			connectorType: "image",
			provider,
			config: {
				...config,
				plugins: buildCharacterAvatarPlugins(projectId, name),
			},
			prompt: "",
			extraParams: { projectId },
			inputs: { prompt: name, attributes: { kind: "avatar" } },
		}));

	queue.enqueueAll(jobs);
}
