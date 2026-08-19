import dedent from "dedent";
import { z } from "zod";
import { defineTool, imagePart } from "./defineTool";

export const viewAvatar = defineTool({
	description: dedent`
	  Look at a character's avatar image. You receive the image itself.

	  Use it to write an appearance for a character whose avatar was uploaded by the user:
	  look, then persist what you see with set_character so every future script keeps it.
	  What you see is gone next turn, so act on it in this one.
	`,
	input: z.object({
		name: z
			.string()
			.min(1)
			.describe(
				"The exact character name, as the script and characters list use it.",
			),
	}),
	output: z.object({ name: z.string(), url: z.string() }),
	toModelOutput: ({ output }) => ({
		type: "content",
		value: [
			{ type: "text", text: `${output.name}'s avatar:` },
			imagePart(output.url),
		],
	}),
	execute: async ({ name }, ctx) => {
		const url = ctx.avatarUrl(name);
		if (!url)
			throw new Error(
				`${name} has no avatar image yet. It appears once the avatar is uploaded or generated.`,
			);
		return { name, url };
	},
});
