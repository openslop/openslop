import dedent from "dedent";
import { z } from "zod";
import { defineTool } from "./defineTool";

export const adaptScript = defineTool({
	description: dedent`
	  Put text the user wrote onto the canvas, keeping their words. This clears the canvas and
	  starts from scratch. Use it whenever the message carries the script itself: a screenplay,
	  a draft, prose, a transcript, lyrics, anything already written.

	  Pass their text through EXACTLY as they gave it. Never summarize it, rewrite it, shorten
	  it, or describe it, however long it is. Passing a summary here destroys the user's work,
	  because nothing downstream can recover the original.

	  If the message mixes their text with instructions about it ("make this shorter, here it
	  is: ..."), adapt the text as written, then edit_script to carry out the instruction.
	`,
	input: z.object({
		script: z
			.string()
			.min(1)
			.describe("The user's own text, verbatim and complete."),
	}),
	output: z.string(),
	execute: async ({ script }, ctx) => {
		await ctx.adaptScript(script);
		return "Put that script onto the canvas. Read it to see what landed.";
	},
});
