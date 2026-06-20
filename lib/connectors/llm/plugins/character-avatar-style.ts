import dedent from "dedent";
import { getProjectStore } from "@/lib/project/store";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";

export function createCharacterAvatarStylePlugin(projectId: string): LLMPlugin {
	return {
		name: "character-avatar-style",
		async transformPrompt(
			prompt: string,
			ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
		) {
			const characters =
				getProjectStore(projectId).getState().metadata.characters ?? {};
			const withAvatar = Object.entries(characters).flatMap(([name, c]) =>
				c.avatarUrl ? [{ name, character: c, url: c.avatarUrl }] : [],
			);
			if (withAvatar.length === 0) return prompt;

			const described = await Promise.all(
				withAvatar.map(async ({ name, character, url }) => {
					// Reuse appearance text from generated avatars
					if (!character.avatarUploaded && character.appearance.trim())
						return `- ${name}: ${character.appearance.trim()}`;

					const gateway = ctx?.gateway;
					if (!gateway)
						throw new Error(
							"character-avatar-style plugin requires gateway context",
						);
					const { text } = await gateway.generate({
						prompt: dedent`Concisely describe the visual appearance of the character in the attached reference image in a short sentence. Focus on gender, ethnicity, face, hair, body type, art style, and any distinctive features. Do not describe the background.`,
						referenceImages: [url],
						maxTokens: 4096,
					});
					return `- ${name}: ${text.trim()}`;
				}),
			);

			return dedent`Character appearances (preserve these appearance descriptions exactly for these characters):
			${described.join("\n")}

			${prompt}`;
		},
	};
}
