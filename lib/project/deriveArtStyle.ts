import dedent from "dedent";
import compact from "lodash/compact";
import type { LLMConnector } from "@/lib/connectors/types";
import type { NodeResults } from "@/lib/generation/graph";
import { uploadedAvatarUrl } from "./characterAvatar";
import type { ProjectData } from "./store";

const DERIVE_PROMPT = dedent`Describe the visual art style of the attached reference image(s) in 1–2 concise sentences: the medium, linework, shading, colors and lighting, with specific detail on how characters are drawn. Never mention a place, a setting, a time of day, the subjects or what is happening: the description is placed in front of the prompt for every scene, so it must fit all of them. Reply with only the description.`;

/** Generated avatars already carry the style, so reading them back is circular. */
export function uploadedAvatarUrls(
	state: ProjectData,
	results: NodeResults,
): string[] {
	return compact(
		Object.keys(state.metadata.characters).map((name) =>
			uploadedAvatarUrl(results, name),
		),
	);
}

export function artStyleReferences(
	state: ProjectData,
	results: NodeResults,
): string[] {
	return [...state.referenceImages, ...uploadedAvatarUrls(state, results)];
}

/** "" when there is nothing to read, so callers can leave the style alone. */
export async function deriveArtStyle(
	llm: Pick<LLMConnector, "generate">,
	state: ProjectData,
	results: NodeResults,
): Promise<string> {
	const referenceImages = artStyleReferences(state, results);
	if (referenceImages.length === 0) return "";
	const { text } = await llm.generate({
		prompt: DERIVE_PROMPT,
		referenceImages,
		maxTokens: 4096,
		thinkingLevel: "low",
	});
	return text.trim();
}
