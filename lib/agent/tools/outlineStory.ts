import dedent from "dedent";
import { z } from "zod";
import { spokenLanguage } from "@/lib/script/prompt/language";
import { defineTool } from "./defineTool";

const outlinePrompt = (brief: string, language: string) =>
	dedent`Outline an engaging story with a high-concept premise, characters, themes, conflict, twists, and a resolution. The story should be about the following: ${brief}. Write the outline in ${language}. Do not write anything else, just the outline.`;

export const outlineStory = defineTool({
	description: dedent`
	  Develop a brief into a full story outline: a high-concept premise, characters, themes,
	  conflict, twists, and a resolution. A dedicated pass at structure produces noticeably
	  better stories than writing straight from an idea, so the outline comes back to you to
	  review and fold into a write_script brief.

	  Reach for it when inventing a narrative: fiction, a fable, a character-driven piece.
	  Skip it when the user's request is not story-shaped (a documentary, an explainer, a
	  listicle, an ambient piece) or when they already supplied the structure. A template is
	  supplied structure: when the project has one, write_script already writes to its format
	  and example story, so go straight there.
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
	execute: async ({ brief }, ctx) => {
		const language = spokenLanguage(
			ctx.readMetadata(),
			"the same language as that input",
		);
		return ctx.generateText(outlinePrompt(brief, language), {
			maxTokens: 8192,
		});
	},
});
