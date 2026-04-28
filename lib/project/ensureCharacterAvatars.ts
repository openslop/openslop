import type { ConnectorRegistry } from "@/lib/config/ConfigProvider";
import { getDefaultConnector } from "@/lib/config/connectorUtils";
import { generateForElement } from "@/lib/generation/generateForElement";
import { getProjectStore } from "./store";

export async function ensureCharacterAvatars(
	projectId: string,
	registry: ConnectorRegistry,
): Promise<void> {
	const store = getProjectStore(projectId);
	const { characters } = store.getState().metadata;
	const { provider, config } = getDefaultConnector(registry, "image");

	// Style is prepended by the art-style plugin on the image connector chain.
	await Promise.all(
		Object.entries(characters)
			.filter(([, ch]) => !ch.avatarUrl && ch.description)
			.map(async ([name, ch]) => {
				const prompt = [`Character portrait of ${name}`, ch.description].join(
					". ",
				);

				const result = await generateForElement(
					"image",
					provider,
					config,
					prompt,
					{},
				);
				return store.getState().updateMetadata({
					characters: { [name]: { avatarUrl: result.url } },
				});
			}),
	);
}
