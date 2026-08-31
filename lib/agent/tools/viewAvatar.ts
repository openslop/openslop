import dedent from "dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { defineTool, imageOutput } from "./defineTool";

export const viewAvatar = defineTool({
	description: dedent`
	  Look at a character's avatar image. You receive the image itself.
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
	icon: Eye,
	label: ({ name }) =>
		name ? `Looking at ${name}'s avatar` : "Looking at an avatar",
	toModelOutput: ({ output }) =>
		imageOutput(`${output.name}'s avatar:`, output.url),
	execute: async ({ name }, ctx) => {
		const url = ctx.avatarUrl(name);
		if (!url)
			throw new Error(
				`${name} has no avatar image yet. It appears once the avatar is uploaded or generated.`,
			);
		return { name, url };
	},
	snapshot: true,
});
