import { dedent } from "@/lib/dedent";
import { z } from "zod";
import type { SpeechEstimate } from "@/lib/canvas/spoken-words";
import { SPEECH_WORDS_PER_MINUTE } from "@/lib/project/video-length";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./define-tool";

const line = ({ id, words, seconds: sec }: SpeechEstimate) =>
	`speech ${id}: ${words} words, about ${seconds(sec)}`;

export const estimateSpeechLengths = defineTool({
	description: dedent`
	  Estimates how long each speech element runs, from its words at
	  ${SPEECH_WORDS_PER_MINUTE} words a minute. You can't tell length by reading the script.
	  For how long the whole video runs, use estimate_total_length.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Hourglass,
	label: "Estimating speech lengths",
	execute: async (_input, ctx) => {
		const estimates = ctx.estimateSpeechLengths();
		if (estimates.length === 0) return "No speech on the canvas yet.";
		return estimates.map(line).join("\n");
	},
});
