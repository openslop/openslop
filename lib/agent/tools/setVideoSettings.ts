import dedent from "dedent";
import { z } from "zod";
import { ASPECT_RATIOS } from "@/lib/video/aspectRatio";
import {
	VIDEO_LENGTHS,
	VIDEO_LENGTH_SPECS,
	VIDEO_LENGTH_TARGETS,
} from "@/lib/video/videoLength";
import { defineTool } from "./defineTool";
import { named, notEmpty } from "./inputs";

export const setVideoSettings = defineTool({
	description: dedent`
	  Set how long the finished video runs, or the shape it is framed in. Send only what changes.

	  Length is a budget the next written script is held to; it does not resize a script already
	  on the canvas. To change what is there, set the length and then edit_script.

	  Lengths, with the spoken-word budget each carries:
	  - auto: no budget. The script runs as long as the material needs.
	${VIDEO_LENGTH_TARGETS.map((l) => `  - ${l}: ${VIDEO_LENGTH_SPECS[l].minWords} to ${VIDEO_LENGTH_SPECS[l].maxWords} words`).join("\n")}
	`,
	input: z
		.object({
			length: z.enum(VIDEO_LENGTHS).optional(),
			aspect_ratio: z.enum(ASPECT_RATIOS).optional(),
		})
		.refine(notEmpty, named("setting")),
	output: z.string(),
	execute: async ({ length, aspect_ratio }, ctx) => {
		ctx.setMetadata({
			videoSettings: {
				...(length !== undefined && { length }),
				...(aspect_ratio !== undefined && { aspectRatio: aspect_ratio }),
			},
		});

		const changed = [
			length !== undefined && `length to ${length}`,
			aspect_ratio !== undefined && `aspect ratio to ${aspect_ratio}`,
		].filter(Boolean);

		return `Set the ${changed.join(" and ")}. It applies to the next script written, not to what is on the canvas.`;
	},
});
