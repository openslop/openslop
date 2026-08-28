import dedent from "dedent";
import { z } from "zod";
import { User } from "@/components/ui/icon";
import { defineTool } from "./defineTool";
import { VOICE_TRAITS } from "./inputs";

export const setCharacter = defineTool({
	description: dedent`
	  Set what a character looks like or sounds like, creating it if the name is new.
	  Reference a character by the exact \`name\` its lines use in the script.

	  Send only what changes. \`appearance\` is what the character's avatar is drawn from, and
	  is always English. The rest describe the voice it speaks in.
	`,
	input: z.object({
		name: z.string().min(1),
		appearance: z
			.string()
			.min(1)
			.optional()
			.describe("What the character looks like, in English."),
		...VOICE_TRAITS,
	}),
	output: z.string(),
	icon: User,
	label: ({ name }) =>
		name ? `Setting the character ${name}` : "Setting a character",
	execute: async ({ name, ...patch }, ctx) => {
		const settled = ctx.setCharacter(name, patch);

		return settled.created
			? `Added ${settled.name}. Its avatar has not been generated yet.`
			: `Changed ${settled.name}.`;
	},
});
