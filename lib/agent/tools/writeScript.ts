import dedent from "dedent";
import { z } from "zod";
import { defineTool } from "./defineTool";

export const writeScript = defineTool({
	description: dedent`
	  Write a new script onto the canvas from a brief. This clears the canvas and starts
	  from scratch. Use this to start a project, or when the user asks for a fresh start on
	  a different idea. For any change to an existing script, however large, use edit_script.

	  The brief is the writer's whole instruction: anything from a one-line premise to a
	  full treatment, carrying the genre, tone, characters, structure and constraints the
	  video needs. For an invented narrative, outline_story first and fold the outline in;
	  for non-story videos, write the brief directly.

	  When the user gave you the actual text they want on the canvas, rather than an idea to
	  write from, use adapt_script instead.
	`,
	input: z.object({
		brief: z
			.string()
			.min(1)
			.describe("What the video is about, in a sentence or a few."),
	}),
	output: z.string(),
	execute: async ({ brief }, ctx) => {
		await ctx.writeScript(brief);
		return "Wrote a new script onto the canvas. Read it to see what landed.";
	},
	rewritesCanvas: true,
});
