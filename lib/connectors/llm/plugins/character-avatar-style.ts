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
			const uploaded = Object.entries(characters).flatMap(([name, c]) =>
				c.avatarUploaded && c.avatarUrl ? [{ name, url: c.avatarUrl }] : [],
			);
			if (uploaded.length === 0) return prompt;
			const gateway = ctx?.gateway;
			if (!gateway)
				throw new Error(
					"character-avatar-style plugin requires gateway context",
				);

			const described = await Promise.all(
				uploaded.map(async ({ name, url }) => {
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
