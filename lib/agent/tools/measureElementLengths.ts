import dedent from "dedent";
import { z } from "zod";
import type { ElementLength } from "@/lib/video/elementLengths";
import { NARRATION_WORDS_PER_MINUTE } from "@/lib/video/videoLength";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./defineTool";

const WORDS_PER_SECOND = Math.round(NARRATION_WORDS_PER_MINUTE / 60);

const from = ({ words, dialogueIds }: ElementLength) =>
	words === 0
		? "nothing after it, so it holds the minimum"
		: `from ${words} words of dialogue after it (${dialogueIds.join(", ")})`;

const line = (length: ElementLength) =>
	`Scene ${length.sceneNumber} ${length.type} ${length.id}: ${seconds(length.seconds)}, ${from(length)}.`;

export const measureElementLengths = defineTool({
	description: dedent`
	  Measure each visual: how long every image, animated_image and clip on the canvas is on
	  screen, and which dialogue decides it. For the whole video's runtime, use
	  measure_total_length instead.

	  A visual is on screen for as long as the dialogue that follows it, up to the next
	  visual, about ${WORDS_PER_SECOND} spoken words a second. The \`duration\` on an
	  animated_image or clip is the generated video's length, not its time on screen.

	  Run this whenever the user asks how long something is shown, or asks to change it. To
	  shorten a visual, split the dialogue after it and insert a visual at the split; to
	  lengthen one, merge or add dialogue.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Hourglass,
	label: "Measuring scene lengths",
	execute: async (_input, ctx) => {
		const lengths = ctx.measureElementLengths();
		if (lengths.length === 0) return "No visual elements on the canvas yet.";

		return [
			`Estimated from the script at ${NARRATION_WORDS_PER_MINUTE} words a minute. Real lengths land once the audio is generated.`,
			...lengths.map(line),
		].join("\n");
	},
});
