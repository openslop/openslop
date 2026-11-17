import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { FolderOpen } from "@/components/ui/icon";
import { MediaItemSchema } from "@/lib/project/media";
import { defineTool } from "./define-tool";

const MediaSummarySchema = MediaItemSchema.omit({ captions: true }).extend({
	hasCaptions: z.boolean(),
});

export const readMedia = defineTool({
	description: dedent`
	  List every image, video and audio file in the project's media library, with its name,
	  kind, URL and whether it has timed captions.
	`,
	input: z.object({}),
	output: z.array(MediaSummarySchema),
	icon: FolderOpen,
	label: "Reading the media library",
	execute: async (_input, ctx) =>
		ctx.readProject().media.map(({ captions, ...item }) => ({
			...item,
			hasCaptions: captions !== undefined,
		})),
	snapshot: true,
});
