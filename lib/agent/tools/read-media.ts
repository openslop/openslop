import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { FolderOpen } from "@/components/ui/icon";
import { MediaItemSchema } from "@/lib/project/media";
import { defineTool } from "./define-tool";

export const readMedia = defineTool({
	description: dedent`
	  List every image, video and audio file in the project's media library, with its name,
	  kind and URL.
	`,
	input: z.object({}),
	output: z.array(MediaItemSchema),
	icon: FolderOpen,
	label: "Reading the media library",
	execute: async (_input, ctx) => ctx.readProject().media,
	snapshot: true,
});
