import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { FRAME_KEYS, frameNames } from "@/lib/connectors/video/start-frame";
import { ResultViewSchema, type ResultView } from "../element-result";
import { defineTool, imageOutput, seconds } from "./define-tool";

const image = ({ url, at }: ResultView["images"][number]) =>
	at === undefined ? `image: ${url}` : `frame at ${seconds(at)}: ${url}`;

const word = ({ text, startMs, endMs }: ResultView["words"][number]) =>
	`[${seconds(startMs / 1000)}-${seconds(endMs / 1000)}] ${text}`;

/** What the model is about to see, URL by URL, then every word with its time. */
export const describeResult = ({ durationSec, images, words }: ResultView) =>
	[
		...(durationSec > 0 ? [`${seconds(durationSec)} long`] : []),
		...images.map(image),
		...words.map(word),
	].join("\n");

export const viewResult = defineTool({
	description: dedent`
	  Look at what an element holds, generated or uploaded, so you can say whether a result
	  matches what its text asks for. An image comes back as itself. A video
	  comes back as frames from its ${frameNames(FRAME_KEYS)}, each with its time, and its
	  length. A voice line, sound or music comes back as its length, with every word and when
	  it is said where there are words. Take the id from read_script.
	`,
	input: z.object({
		id: z
			.string()
			.min(1)
			.describe("The element's id, exactly as read_script gives it."),
	}),
	output: ResultViewSchema,
	icon: Eye,
	toModelOutput: ({ output }) =>
		imageOutput(describeResult(output), ...output.images.map(({ url }) => url)),
	snapshot: true,
	label: ({ id }) => (id ? `Looking at ${id}` : "Looking at a result"),
	execute: async ({ id }, ctx) => {
		const result = await ctx.elementResult(id);
		if (!result)
			throw new Error(
				`There is no element ${id} on the canvas. Read the script for the ids there are.`,
			);
		if (!result.ok)
			throw new Error(
				`${id} ${result.reason}, so there is nothing to look at.`,
			);
		return result.view;
	},
});
