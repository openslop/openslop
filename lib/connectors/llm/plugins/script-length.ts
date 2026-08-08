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

				Write between ${minWords} and ${maxWords} words of spoken narration and
				dialogue in total. Scene descriptions, visual directions, and attributes do
				not count toward that budget.

				Pace the story to reach a complete ending inside the budget instead of
				trailing off or padding, and add or remove scenes as needed to hit it.`,
		);
	},
};
