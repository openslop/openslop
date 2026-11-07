import { dedent } from "@/lib/dedent";
import { z } from "zod";
import {
	NARRATION_WORDS_PER_MINUTE,
	videoLengthBudget,
} from "@/lib/project/video-length";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./define-tool";

const minutes = (sec: number) => (sec / 60).toFixed(1);

export const estimateTotalLength = defineTool({
	description: dedent`
	  Estimate how long the finished video will run, from the script alone, against the
	  project's target length. Speech counts at ${NARRATION_WORDS_PER_MINUTE} words a minute
	  (narration and dialogue only; prompts and attributes are silent), and each video counts
	  its \`duration\` or trim even with nothing spoken over it. Speech before the first visual
	  plays over a blank screen. For each line of dialogue, use estimate_dialogue_lengths.

	  You cannot judge length by looking at a script, so run this after writing or editing
	  whenever length matters, and edit until the estimate lands in the target range.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Hourglass,
	label: "Estimating the total length",
	execute: async (_input, ctx) => {
		const words = ctx.countSpokenWords();
		const runtime = ctx.estimateRuntime();
		const { length } = ctx.readProject().scriptSettings;
		const estimate = `About ${seconds(runtime)} of video (${minutes(runtime)} minutes), carrying ${words} spoken words.`;

		const budget = videoLengthBudget(length);
		if (!budget) return `${estimate} Target: auto, so any length is fine.`;

		const { minSec, maxSec } = budget;
		const verdict =
			runtime < minSec
				? `under by ${seconds(minSec - runtime)}`
				: runtime > maxSec
					? `over by ${seconds(runtime - maxSec)}`
					: "within the target range";

		return `${estimate} Target: ${length} (${seconds(minSec)} to ${seconds(maxSec)}) - ${verdict}.`;
	},
});
