import { dedent } from "@/lib/dedent";
import { z } from "zod";
import type { DialogueEstimate } from "@/lib/canvas/spoken-words";
import { NARRATION_WORDS_PER_MINUTE } from "@/lib/project/video-length";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./define-tool";

const line = ({ type, id, words, seconds: sec }: DialogueEstimate) =>
	`${type} ${id}: ${words} words, about ${seconds(sec)}`;

export const estimateDialogueLengths = defineTool({
	description: dedent`
	  Estimates how long each narration and character line runs, from its words at
	  ${NARRATION_WORDS_PER_MINUTE} words a minute. For how long the whole video runs, use
	  estimate_total_length.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Hourglass,
	label: "Estimating dialogue lengths",
	execute: async (_input, ctx) => {
		const estimates = ctx.estimateDialogueLengths();
		if (estimates.length === 0) return "No dialogue on the canvas yet.";
		return estimates.map(line).join("\n");
	},
});
