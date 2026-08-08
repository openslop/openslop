import dedent from "dedent";
import { requireState } from "@/lib/connectors/plugins";
import type { LLMPlugin } from "@/lib/connectors/types";
import { resolveVideoLengthSpec } from "@/lib/video/videoLength";
import { prependSystemPrompt } from "./system-prompt";

export const scriptLengthPlugin: LLMPlugin = {
	name: "scriptLength",
	beforeGenerate(params, ctx) {
		const { metadata } = requireState(ctx, "scriptLength");
		const { minWords, maxWords } = resolveVideoLengthSpec(metadata);

		return prependSystemPrompt(
			params,
			dedent`
				# Length

				Write ${minWords} to ${maxWords} words of dialogue. Only spoken words count;
				descriptions and attributes do not.`,
		);
	},
};
