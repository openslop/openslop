import dedent from "dedent";
import { requireState } from "@/lib/connectors/plugins";
import type { LLMPlugin } from "@/lib/connectors/types";
import {
	WORDS_PER_SPOKEN_ELEMENT,
	resolveVideoLengthSpec,
} from "@/lib/video/videoLength";
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

				Write ${minElements} to ${maxElements} <narration> and <character> elements,
				each carrying about ${WORDS_PER_SPOKEN_ELEMENT} words of speech, for a total
				of ${minWords} to ${maxWords} spoken words. Give each one its own <image> or
				<animated_image>, so expect ${minElements} to ${maxElements} of those too.

				Count the elements as you write and keep going until you reach ${minElements}.
				Falling short is a failure, not a tighter edit: cover more of the story, break
				beats into smaller moments, and give each its own shot. Do not pad a line past
				about ${WORDS_PER_SPOKEN_ELEMENT} words to get there, and do not stop early
				once the story feels complete.

				Only spoken words count. Image descriptions, video prompts, and attributes do
				not.`,
		);
	},
};
