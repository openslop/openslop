import dedent from "dedent";
import compact from "lodash/compact";
import { requireGateway } from "@/lib/connectors/plugins";
import { getProjectStore } from "@/lib/project/store";
import type {
	LLMGenerateParams,
	LLMGenerateResult,
	LLMPlugin,
	PluginContext,
} from "@/lib/connectors/types";

export function createReferenceStylePlugin(projectId: string): LLMPlugin {
	return {
		name: "reference-style",
		async transformPrompt(
			prompt: string,
			ctx?: PluginContext<LLMGenerateParams, LLMGenerateResult>,
		) {
			const { metadata, referenceImages } =
				getProjectStore(projectId).getState();
			const styleReferenceImages = compact([
				...referenceImages,
				...Object.values(metadata.characters).map((character) =>
					character.avatarUploaded ? character.avatarUrl : undefined,
				),
			]);
			if (styleReferenceImages.length === 0) return prompt;
			const gateway = requireGateway(ctx, "reference-style");
			const { text: style } = await gateway.generate({
				prompt: dedent`Vividly and concisely describe the visual art style of the attached reference image(s) in 1–2 concise sentences. Include ultra specific detail on character art style and overall art style.`,
				referenceImages: styleReferenceImages,
				maxTokens: 4096,
			});
			return dedent`Art style reference: ${style}

			${prompt}`;
		},
	};
}
