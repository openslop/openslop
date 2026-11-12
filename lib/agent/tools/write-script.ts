import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Film } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const writeScript = defineTool({
	description: dedent`
	  Write a new script onto the canvas from a brief. This clears the script and starts
	  from scratch. Use this to start a project, or
	  when the user asks for a fresh start on a different idea. For any change to an
	  existing script, however large, use edit_script.

	  The brief is the writer's whole instruction: anything from a one-line premise to a
	  full treatment, carrying the genre, tone, characters, structure and constraints the
	  finished video needs. For a story prompt without a sufficient plot outline, outline_story first and fold the outline in;
	  for anything that is not a story, write the brief directly.

	  The writer reads the brief, the script settings and the assets, never this conversation.

	  When the user gave you the actual text they want on the canvas, rather than an idea to
	  write from, use adapt_script instead.
	`,
	input: z.object({
		brief: z
			.string()
			.min(1)
			.describe(
				"What the finished video is about, from a one-line premise to a full treatment, in the user's language.",
			),
	}),
	output: z.string(),
	icon: Film,
	label: "Writing a new script",
	execute: async ({ brief }, ctx) => {
		await ctx.writeScript(brief);
		return "Wrote a new script onto the canvas. Read it to see what landed.";
	},
	draftsScript: true,
});
