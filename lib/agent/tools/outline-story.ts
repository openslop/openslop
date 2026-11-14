import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { spokenLanguage } from "@/lib/script/prompt/language";
import { outlinePrompt } from "@/lib/script/prompt/outline";
import { Pencil } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const outlineStory = defineTool({
	description: dedent`
	  Turn a story idea into a full outline: premise, characters, conflict, twists and ending.
	  You get the outline back to put into a write_script brief.

	  Use it for made-up stories. Skip it when the request isn't a story, when the user already
	  gave the plot, or when the project has a template, since write_script already follows it.
	`,
	input: z.object({
		brief: z
			.string()
			.min(1)
			.describe(
				"The story idea to develop, with any constraints worth keeping.",
			),
	}),
	output: z.string(),
	icon: Pencil,
	label: "Outlining the story",
	execute: async ({ brief }, ctx) => {
		const language = spokenLanguage(
			ctx.readProject().scriptSettings,
			"the same language as that input",
		);
		return ctx.generateText(outlinePrompt(brief, language), {
			maxTokens: 8192,
		});
	},
});
