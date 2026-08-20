import dedent from "dedent";
import { z } from "zod";
import { LANGUAGE_CHOICES, languageLabel } from "@/lib/project/language";
import { defineTool } from "./defineTool";

export const setLanguage = defineTool({
	description: dedent`
	  Set the language narration and dialogue are written in. "auto" follows whatever language
	  the user writes in.

	  This applies to scripts written from here on. It does not translate what is on the canvas.

	  Languages: ${LANGUAGE_CHOICES.map((c) => `${c} (${languageLabel(c)})`).join(", ")}
	`,
	input: z.object({ language: z.enum(LANGUAGE_CHOICES) }),
	output: z.string(),
	execute: async ({ language }, ctx) => {
		ctx.setMetadata({ language });
		return `Set the language to ${languageLabel(language)}. It applies to the next script written; what is on the canvas is unchanged.`;
	},
});
