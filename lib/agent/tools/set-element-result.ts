import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Upload } from "@/components/ui/icon";
import { storedUrl } from "@/lib/api/request-schema-fields";
import { errorMessage } from "@/lib/errors";
import { conjunction, plural } from "@/lib/format";
import { UPLOADABLE_TYPES } from "@/lib/upload/uploaded-result";
import { defineTool } from "./define-tool";

export const setElementResult = defineTool({
	description: dedent`
	  Put files from our store on elements, as if the user uploaded them. Generate All leaves
	  them alone. Works on ${conjunction(UPLOADABLE_TYPES)} elements. Get the ids from
	  read_script.
	`,
	input: z.object({
		results: z
			.array(
				z.object({
					id: z
						.string()
						.min(1)
						.describe("The element's id, exactly as read_script gives it."),
					url: storedUrl("Each URL"),
				}),
			)
			.min(1),
	}),
	output: z.string(),
	icon: Upload,
	label: ({ results }) =>
		results?.length
			? `Setting files on ${results.length} ${plural(results.length, "element")}`
			: "Setting files",
	execute: async ({ results }, ctx) => {
		const outcomes = await Promise.allSettled(
			results.map(({ id, url }) => ctx.setElementResult(id, url)),
		);
		return outcomes
			.map((outcome, index) =>
				outcome.status === "fulfilled"
					? `Set ${results[index].id}.`
					: `Skipped ${results[index].id}: ${errorMessage(outcome.reason)}`,
			)
			.join("\n");
	},
});
