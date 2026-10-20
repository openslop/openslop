import { sceneLabel } from "@/lib/canvas/constants";
import { dedent } from "@/lib/dedent";
import { z } from "zod";
import type { ElementLength } from "@/lib/render/element-lengths";
import { MIN_DURATION_SEC } from "@/lib/render/scene-builder";
import { NARRATION_WORDS_PER_MINUTE } from "@/lib/project/video-length";
import { Hourglass } from "@/components/ui/icon";
import { defineTool, seconds } from "./define-tool";

const WORDS_PER_SECOND = Math.round(NARRATION_WORDS_PER_MINUTE / 60);

const dialogue = ({ words, dialogueIds }: ElementLength) =>
	`${words} words of dialogue (${dialogueIds.join(", ")})`;

const REASONS: Record<
	ElementLength["decidedBy"],
	(length: ElementLength) => string
> = {
	duration: (length) =>
		`its own length; ${length.words === 0 ? "no dialogue" : dialogue(length)} after it`,
	dialogue: (length) =>
		length.durationSec === undefined
			? `${dialogue(length)} after it`
			: `${dialogue(length)} after it, longer than its ${seconds(length.durationSec)} duration`,
	minimum: (length) =>
		length.words === 0
			? "the minimum, no dialogue after it"
			: `the minimum, longer than the ${dialogue(length)} after it`,
};

const line = (length: ElementLength) =>
	`${sceneLabel(length.sceneNumber)} ${length.type} ${length.id}: ${seconds(length.seconds)}, ${REASONS[length.decidedBy](length)}.`;

export const measureElementLengths = defineTool({
	description: dedent`
	  Returns how long each image and video on the canvas is on screen, and what sets that
	  length. For the total runtime, use measure_total_length.

	  A visual is on screen for its own length or the dialogue after it, up to the next
	  visual, whichever is longer. An image has no length of its own; a video's is its
	  \`duration\`. Dialogue runs at about ${WORDS_PER_SECOND} words a second. Every visual
	  is on screen for at least ${seconds(MIN_DURATION_SEC)}.

	  Use this when the user asks how long something is shown or wants it changed. To
	  shorten a visual set by its dialogue, split the dialogue after it and insert a visual
	  at the split; to lengthen one, add dialogue after it. For a video set by its own
	  length, change \`duration\`.
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
