import dedent from "dedent";
import { z } from "zod";
import type { ElementLength } from "@/lib/render/elementLengths";
import { MIN_DURATION_SEC } from "@/lib/render/scene-builder";
import {
	NARRATION_WORDS_PER_MINUTE,
	secondsForWords,
} from "@/lib/project/videoLength";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./defineTool";

const WORDS_PER_SECOND = Math.round(NARRATION_WORDS_PER_MINUTE / 60);

const dialogue = ({ words, dialogueIds }: ElementLength) =>
	`${words} words of dialogue (${dialogueIds.join(", ")})`;

/** Which of its duration, its dialogue or the minimum set the length. */
const reason = (length: ElementLength) => {
	const { trimToDialogue, durationSec, words } = length;
	const dialogueSec = secondsForWords(words);
	const untrimmed = !trimToDialogue && durationSec !== undefined;

	if (
		untrimmed &&
		durationSec >= dialogueSec &&
		durationSec >= MIN_DURATION_SEC
	) {
		const after = words === 0 ? "no dialogue" : dialogue(length);
		return `its full duration, untrimmed; ${after} after it`;
	}
	if (words === 0 || dialogueSec < MIN_DURATION_SEC)
		return "the minimum, no dialogue after it";
	if (untrimmed)
		return `${dialogue(length)} after it, longer than its ${seconds(durationSec)} duration`;
	return `${dialogue(length)} after it`;
};

const line = (length: ElementLength) =>
	`Scene ${length.sceneNumber} ${length.type} ${length.id}: ${seconds(length.seconds)}, ${reason(length)}.`;

export const measureElementLengths = defineTool({
	description: dedent`
	  Returns how long each image and video on the canvas is on screen, and what sets that
	  length. For the total runtime, use measure_total_length.

	  A visual with trimToDialogue="true" (the default) is on screen for the dialogue after
	  it, up to the next visual, at about ${WORDS_PER_SECOND} words a second. A video with
	  trimToDialogue="false" is on screen for its \`duration\` or its dialogue, whichever
	  is longer. Every visual is on screen for at least ${seconds(MIN_DURATION_SEC)}.

	  Use this when the user asks how long something is shown or wants it changed. To
	  shorten a trimmed visual, split the dialogue after it and insert a visual at the
	  split. To lengthen it, add dialogue after it. For an untrimmed
	  video, change \`duration\`, and shorten the dialogue if the dialogue is longer.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Hourglass,
	label: "Measuring scene lengths",
	execute: async (_input, ctx) => {
		const lengths = ctx.measureElementLengths();
		if (lengths.length === 0) return "No images or videos on the canvas yet.";

		return [
			`Estimated from the script at ${NARRATION_WORDS_PER_MINUTE} words a minute. Actual lengths depend on the generated audio.`,
			...lengths.map(line),
		].join("\n");
	},
});
