import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Upload } from "@/components/ui/icon";
import { conjunction } from "@/lib/format";
import { UPLOAD_KIND_OF } from "@/lib/upload/uploaded-result";
import { defineTool } from "./define-tool";

export const setElementMedia = defineTool({
	description: dedent`
	  Put an image, video or audio file on an element, the same as if the user uploaded it
	  there. Generate All will leave it alone. Works on ${conjunction(Object.keys(UPLOAD_KIND_OF))}
	  elements, and the file must be the right kind. Get the id from read_script and the URL
	  from read_media.
	`,
	input: z.object({
		id: z
			.string()
			.min(1)
			.describe("The element's id, exactly as read_script gives it."),
		url: z.url().describe("The file's URL."),
	}),
	output: z.string(),
	icon: Upload,
	label: ({ id }) => (id ? `Setting ${id}'s media` : "Setting media"),
	execute: async ({ id, url }, ctx) => {
		await ctx.setElementMedia(id, url);
		return `Put the file on ${id}.`;
	},
});
