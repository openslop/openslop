import { dedent } from "@/lib/dedent";
import { z } from "zod";
import type { DialogueLength } from "@/lib/canvas/spoken-words";
import { NARRATION_WORDS_PER_MINUTE } from "@/lib/project/video-length";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./define-tool";

const line = ({ type, id, words, seconds: sec }: DialogueLength) =>
	`${type} ${id}: ${words} words, about ${seconds(sec)}`;

export const measureDialogueLengths = defineTool({
	description: dedent`
	  Estimates how long each narration and character line runs, from its words at
	  ${NARRATION_WORDS_PER_MINUTE} words a minute. For how long the whole video runs, use
	  measure_total_length.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Hourglass,
	label: "Measuring dialogue lengths",
	execute: async (_input, ctx) => {
		const lengths = ctx.measureDialogueLengths();
		if (lengths.length === 0) return "No dialogue on the canvas yet.";
		return lengths.map(line).join("\n");
	},
});
