import dedent from "dedent";
import { requireGateway, requireState } from "@/lib/connectors/plugins";
import type { NodeResults } from "@/lib/generation/graph";
import { deriveArtStyle } from "@/lib/project/deriveArtStyle";
import { getProjectStore } from "@/lib/project/store";
import type { LLMPlugin } from "@/lib/connectors/types";

/**
 * Describes the reference images for projects whose art style the user never
 * set, so the script is written to a style rather than to nothing.
 *
 * The derived style is also prepended, not just stored: `projectMetadata`
 * injects from the state snapshot the run started with, which cannot hold a
 * style written mid-run. Writing in the transform phase, which completes
 * before any `beforeGenerate`, keeps the two from injecting it twice.
 */
export function createReferenceStylePlugin(
	projectId: string,
	results: NodeResults,
): LLMPlugin {
	return {
		name: "reference-style",
		async transformPrompt(prompt, ctx) {
			const state = requireState(ctx, "reference-style");
			if (state.metadata.style.trim()) return prompt;

			const style = await deriveArtStyle(
				requireGateway(ctx, "reference-style"),
				state,
				results,
			);
			if (!style) return prompt;

			getProjectStore(projectId).getState().updateMetadata({ style });
			return dedent`Art style reference: ${style}

			${prompt}`;
		},
	};
}
