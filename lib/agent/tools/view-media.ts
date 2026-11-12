import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { requireMedia } from "@/lib/project/media";
import { defineTool } from "./define-tool";
import { viewOutput } from "./view-result";

export const viewMedia = defineTool({
	description: dedent`
	  Look at a file from read_media. An image comes back as itself, a video as a few timed
	  frames plus its length, and audio as its length.
	`,
	input: z.object({
		url: z.url().describe("The file's URL, exactly as read_media gives it."),
	}),
	...viewOutput,
	label: "Looking at the media library",
	execute: async ({ url }, ctx) => {
		const item = requireMedia(ctx.readProject().media, url);
		return { id: item.name, ...(await ctx.viewMedia(item)) };
	},
});
