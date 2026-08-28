import dedent from "dedent";
import { z } from "zod";
import { Film } from "@/components/ui/icon";
import { defineTool } from "./defineTool";

export const adaptScript = defineTool({
	description: dedent`
	  Put text the user wrote onto the canvas, keeping their words. This clears the canvas and
	  starts from scratch. Use it whenever the message carries the script itself: a screenplay,
	  a draft, prose, a transcript, lyrics, anything already written.

	  Send the script span and nothing else. What you send is converted, not just stored:
	  prose that carries no annotation becomes narration, and the project's title, art style,
	  narrator voice and character appearances are all derived from it. A mood note or a
	  "here's my script:" caught in the span is read as a line to speak.

	  Screenplay furniture is stripped for you, so leave slug lines, stage directions and
	  character cues where they are. Nothing is invented either: the conversion adds images,
	  sound and music around their words, never new dialogue or prose.

	  Pass the script through EXACTLY as they gave it. Never summarize, rewrite or shorten it,
	  however long it is. When you cannot tell where the script starts, keep the text rather than cut it.

	  Everything else in the message is still theirs, so place it:
	  - what they said about the look, mood, pacing or delivery goes in 'notes'
	  - a setting they stated outright has its own tool: set_metadata, set_narrator,
	    set_video_settings, set_language, set_character
	  - an instruction about the text itself ("make this shorter") is carried out with
	    edit_script after this call, not by editing what you pass in
	`,
	input: z.object({
		script: z
			.string()
			.min(1)
			.describe(
				"The script itself, verbatim and complete, with the surrounding notes left out.",
			),
		notes: z
			.string()
			.optional()
			.describe(
				"What the user said about the script: look, mood, pacing, delivery. Omit when they said nothing.",
			),
	}),
	output: z.string(),
	icon: Film,
	label: "Putting your script on the canvas",
	execute: async ({ script, notes }, ctx) => {
		await ctx.adaptScript(script, notes);
		return "Put that script onto the canvas. Read it to see what landed.";
	},
	rewritesCanvas: true,
});
