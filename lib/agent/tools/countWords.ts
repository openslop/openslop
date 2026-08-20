import dedent from "dedent";
import { z } from "zod";
import {
	NARRATION_WORDS_PER_MINUTE,
	videoLengthBudget,
} from "@/lib/video/videoLength";
import { defineTool } from "./defineTool";

const minutes = (words: number) =>
	(words / NARRATION_WORDS_PER_MINUTE).toFixed(1);

export const countWords = defineTool({
	description: dedent`
	  Count the spoken words on the canvas (narration and dialogue only; descriptions and
	  attributes are silent) and estimate the video's runtime against the project's target
	  length.

	  You cannot judge length by looking at a script, so run this after writing or editing
	  whenever length matters, and edit until the count lands in the target range.
	`,
	input: z.object({}),
	output: z.string(),
	execute: async (_input, ctx) => {
		const words = ctx.countSpokenWords();
		const { length } = ctx.readMetadata().videoSettings;
		const runtime = `${words} spoken words, about ${minutes(words)} minutes of speech.`;

		const budget = videoLengthBudget(length);
		if (!budget) return `${runtime} Target: auto, so any length is fine.`;

		const { minWords, maxWords } = budget;
		const verdict =
			words < minWords
				? `under by ${minWords - words} words`
				: words > maxWords
					? `over by ${words - maxWords} words`
					: "within the target range";

		return `${runtime} Target: ${length} (${minWords} to ${maxWords} words) - ${verdict}.`;
	},
});
