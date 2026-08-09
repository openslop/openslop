import dedent from "dedent";
import compact from "lodash/compact";
import type { LLMConnector } from "@/lib/connectors/types";
import type { NodeResults } from "@/lib/generation/graph";
import { characterAvatarUrl } from "./characterAvatar";
import type { ProjectData } from "./store";

const DERIVE_PROMPT = dedent`Vividly and concisely describe the visual art style of the attached reference image(s) in 1–2 concise sentences. Include ultra specific detail on character art style and overall art style.`;

/** Generated avatars already carry the style, so reading them back is circular. */
export function artStyleReferences(
	state: ProjectData,
	results: NodeResults,
): string[] {
	return compact([
		...state.referenceImages,
		...Object.entries(state.metadata.characters).map(([name, character]) =>
			character.avatarUploaded ? characterAvatarUrl(results, name) : undefined,
		),
	]);
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
	});
	return text.trim();
}
