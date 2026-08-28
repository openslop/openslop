import dedent from "dedent";
import { z } from "zod";
import { Mic } from "@/components/ui/icon";
import { defineTool } from "./defineTool";
import { named, notEmpty, VOICE_TRAITS } from "./inputs";

export const setNarrator = defineTool({
	description: dedent`
	  Set the voice the narrator reads in. Send only the traits that change.

	  A voice is described, never picked: the traits resolve to a real voice when speech
	  is generated.
	`,
	input: z.object({ ...VOICE_TRAITS }).refine(notEmpty, named("trait")),
	output: z.string(),
	icon: Mic,
	label: "Adjusting the narrator's voice",
	execute: async (traits, ctx) => {
		ctx.setMetadata({ narration: traits });
		return "Set the narrator's voice.";
	},
});
