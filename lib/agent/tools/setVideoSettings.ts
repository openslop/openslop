import dedent from "dedent";
import { z } from "zod";
import { ASPECT_RATIOS } from "@/lib/project/aspectRatio";
import {
	VIDEO_LENGTHS,
	VIDEO_LENGTH_SPECS,
	VIDEO_LENGTH_TARGETS,
} from "@/lib/project/videoLength";
import {
	VIDEO_FORMAT_CHOICES,
	VIDEO_FORMAT_SPECS,
	VIDEO_FORMAT_TARGETS,
} from "@/lib/project/videoFormat";
import { Hourglass } from "@/components/ui/icon";
import { defineTool } from "./defineTool";
import { named, notEmpty } from "./inputs";

export const setVideoSettings = defineTool({
	description: dedent`
	  Set how long the finished video runs, the format it takes, or the shape it is framed in.
	  Send only what changes.

	  Length is a budget the next written script is held to; it does not resize a script already
	  on the canvas. To change what is there, set the length and then edit_script.

	  If the length is auto, set it before you call write_script. Use the runtime the user asked
	  for. If they didn't give one, use the runtime the outline gives. Pick the length that fits
	  that runtime. If none fits, pick the one closest to it.

	  Lengths, with the spoken-word budget each carries:
	  - auto: no budget. The script runs as long as the material needs.
	${VIDEO_LENGTH_TARGETS.map((l) => `  - ${l}: ${VIDEO_LENGTH_SPECS[l].minWords} to ${VIDEO_LENGTH_SPECS[l].maxWords} words`).join("\n")}

	  Formats, which decide what the next written script is made of. Set one only when the
	  user asks for it; on auto the writer picks the format closest to the brief.
	  - auto: the writer chooses.
	${VIDEO_FORMAT_TARGETS.map((f) => `  - ${f}: ${VIDEO_FORMAT_SPECS[f].summary}`).join("\n")}
	`,
	input: z
		.object({
			length: z.enum(VIDEO_LENGTHS).optional(),
			format: z.enum(VIDEO_FORMAT_CHOICES).optional(),
			aspect_ratio: z.enum(ASPECT_RATIOS).optional(),
		})
		.refine(notEmpty, named("setting")),
	output: z.string(),
	icon: Hourglass,
	label: "Adjusting the video settings",
	execute: async ({ length, format, aspect_ratio }, ctx) => {
		ctx.setMetadata({
			videoSettings: {
				...(length !== undefined && { length }),
				...(format !== undefined && { format }),
				...(aspect_ratio !== undefined && { aspectRatio: aspect_ratio }),
			},
		});

		const changed = [
			length !== undefined && `length to ${length}`,
			format !== undefined && `format to ${format}`,
			aspect_ratio !== undefined && `aspect ratio to ${aspect_ratio}`,
		].filter(Boolean);

		return `Set the ${changed.join(" and ")}. It applies to the next script written, not to what is on the canvas.`;
	},
});
