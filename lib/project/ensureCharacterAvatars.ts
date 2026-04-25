import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { generateForElement } from "@/lib/generation/generateForElement";
import { getProjectStore } from "./store";

export async function ensureCharacterAvatars(
	projectId: string,
	registry: ConnectorRegistry,
): Promise<void> {
	const store = getProjectStore(projectId);
	const { characters, style } = store.getState().metadata;
	const { provider, config } = getDefaultConnector(registry, "image");

	await Promise.all(
		Object.entries(characters)
			.filter(([, ch]) => !ch.avatarUrl && ch.description)
			.map(async ([name, ch]) => {
				const prompt = [
					`Character portrait of ${name}`,
					ch.description,
					style,
				].join(". ");

				const result = await generateForElement(
					"image",
					provider,
					config,
					prompt,
					{},
				);
				return store.getState().setCharacterAvatarUrl(name, result.url);
			}),
	);
}
