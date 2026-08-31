import dedent from "dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { defineTool, imageOutput } from "./defineTool";

export const viewReferenceImages = defineTool({
	description: dedent`
	  Look at the images the user uploaded as project references. You receive the images
	  themselves, so use your own eyes: judge the art style, subjects, and mood directly.

	  What you see is gone next turn, so act on it in this one.
	`,
	input: z.object({}),
	output: z.object({ urls: z.array(z.string()) }),
	icon: Eye,
	label: "Looking at the reference images",
	toModelOutput: ({ output }) =>
		imageOutput(
			`${output.urls.length} reference image(s), in upload order:`,
			...output.urls,
		),
	execute: async (_input, ctx) => {
		const urls = ctx.referenceImages();
		if (urls.length === 0)
			throw new Error(
				"No reference images have been uploaded to this project.",
			);
		return { urls };
	},
	snapshot: true,
});
