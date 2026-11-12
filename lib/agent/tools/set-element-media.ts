import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Upload } from "@/components/ui/icon";
import { errorMessage } from "@/lib/errors";
import { conjunction, plural } from "@/lib/format";
import { requireMedia } from "@/lib/project/media";
import { UPLOADABLE_TYPES } from "@/lib/upload/uploaded-result";
import { defineTool } from "./define-tool";

export const setElementMedia = defineTool({
	description: dedent`
	  Put files from read_media on elements, as if the user uploaded them. Generate All leaves
	  them alone. Works on ${conjunction(UPLOADABLE_TYPES)} elements, and each file
	  must be the right kind. Get the ids from read_script.
	`,
	input: z.object({
		files: z
			.array(
				z.object({
					id: z
						.string()
						.min(1)
						.describe("The element's id, exactly as read_script gives it."),
					url: z.url().describe("The file's URL, from read_media."),
				}),
			)
			.min(1),
	}),
	output: z.string(),
	icon: Upload,
	label: ({ files }) =>
		files?.length
			? `Setting media on ${files.length} ${plural(files.length, "element")}`
			: "Setting media",
	execute: async ({ files }, ctx) => {
		const { media } = ctx.readProject();
		const outcomes = await Promise.allSettled(
			files.map(async ({ id, url }) =>
				ctx.setElementMedia(id, requireMedia(media, url)),
			),
		);
		return outcomes
			.map((outcome, index) =>
				outcome.status === "fulfilled"
					? `Put the file on ${files[index].id}.`
					: `Skipped ${files[index].id}: ${errorMessage(outcome.reason)}`,
			)
			.join("\n");
	},
});
