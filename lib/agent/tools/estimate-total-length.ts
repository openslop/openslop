import { dedent } from "@/lib/dedent";
import { z } from "zod";
import {
	SPEECH_WORDS_PER_MINUTE,
	videoLengthBudget,
} from "@/lib/project/video-length";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./define-tool";

const minutes = (sec: number) => (sec / 60).toFixed(1);

export const estimateTotalLength = defineTool({
	description: dedent`
	  Estimate how long the video will be once everything is generated, against the target length.
	  Speech counts at ${SPEECH_WORDS_PER_MINUTE} words a minute. Each video counts its
	  \`duration\`, or an uploaded video its own length, cut to its trim.

	  You can't tell length by reading the script. To hit the target, add or cut speech, then
	  run this again.
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
