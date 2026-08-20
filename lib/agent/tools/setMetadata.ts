import dedent from "dedent";
import { z } from "zod";
import { defineTool } from "./defineTool";
import { named, notEmpty } from "./inputs";

export const setMetadata = defineTool({
	description: dedent`
	  Set the project's title, or the art style every visual follows. Send only what changes.
	`,
	input: z
		.object({
			title: z.string().min(1).optional(),
			style: z
				.string()
				.min(1)
				.optional()
				.describe("The art style every visual follows, in English."),
		})
		.refine(notEmpty, named("setting")),
	output: z.string(),
	execute: async ({ title, style }, ctx) => {
		ctx.setMetadata({
			...(title !== undefined && { title }),
			...(style !== undefined && { style }),
		});

		const changed = [
			title !== undefined && "title",
			style !== undefined && "art style",
		].filter(Boolean);

		return `Set the ${changed.join(" and ")}.`;
	},
});
