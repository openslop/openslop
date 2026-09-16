import dedent from "dedent";
import { z } from "zod";
import { videoLengthBudget } from "@/lib/project/videoLength";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./defineTool";

const minutes = (sec: number) => (sec / 60).toFixed(1);

export const measureTotalLength = defineTool({
	description: dedent`
	  Measure the finished video: how long it runs, and the spoken words behind it (narration
	  and dialogue only; prompts and attributes are silent), against the project's target
	  length. Runtime adds up every visual's time on screen, so a video that plays in full
	  counts its own length even with nothing spoken over it, and a script with no speech at
	  all still has a runtime. For the breakdown per visual, use measure_element_lengths.

	  You cannot judge length by looking at a script, so run this after writing or editing
	  whenever length matters, and edit until the runtime lands in the target range.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Hourglass,
	label: "Measuring the total length",
	execute: async (_input, ctx) => {
		const words = ctx.countSpokenWords();
		const runtime = ctx
			.measureElementLengths()
			.reduce((total, length) => total + length.seconds, 0);
		const { length } = ctx.readMetadata().videoSettings;
		const measured = `${seconds(runtime)} of video, about ${minutes(runtime)} minutes, carrying ${words} spoken words.`;

		const budget = videoLengthBudget(length);
		if (!budget) return `${measured} Target: auto, so any length is fine.`;

		const { minSec, maxSec } = budget;
		const verdict =
			runtime < minSec
				? `under by ${seconds(minSec - runtime)}`
				: runtime > maxSec
					? `over by ${seconds(runtime - maxSec)}`
					: "within the target range";

		return `${measured} Target: ${length} (${seconds(minSec)} to ${seconds(maxSec)}) - ${verdict}.`;
	},
});
