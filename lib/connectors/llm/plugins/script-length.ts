import dedent from "dedent";
import { requireState } from "@/lib/connectors/plugins";
import type { LLMPlugin } from "@/lib/connectors/types";
import { resolveVideoLengthSpec } from "@/lib/video/videoLength";
import { prependSystemPrompt } from "./system-prompt";

export const scriptLengthPlugin: LLMPlugin = {
	name: "scriptLength",
	beforeGenerate(params, ctx) {
		const { metadata } = requireState(ctx, "scriptLength");
		const { minWords, maxWords, minElements, maxElements } =
			resolveVideoLengthSpec(metadata);

		return prependSystemPrompt(
			params,
			dedent`
				# Length

				Write ${minWords} to ${maxWords} words of dialogue, spread over roughly
				${minElements} to ${maxElements} <narration> and/or <character> elements. Only
				spoken words count; descriptions and attributes do not.

				Track both counts as you write. Stopping short is a failure, not a tighter
				edit: cover more of the story rather than shortening any one line.`,
		);
	},
};
