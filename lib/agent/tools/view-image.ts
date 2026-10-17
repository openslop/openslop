import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import { defineTool, imageOutput } from "./define-tool";

export const viewImage = defineTool({
	description: dedent`
	  Look at the pictures an element holds, whether generated or uploaded. You receive the
	  pictures themselves alongside the prompt behind them, so you can say whether a result
	  matches what was asked for. Take the id from read_script.
	  What you see is gone next turn, so act on it in this one.
	`,
	input: z.object({
		id: z
			.string()
			.min(1)
			.describe("The element's id, exactly as read_script gives it."),
	}),
	output: z.object({
		id: z.string(),
		prompt: z.string(),
		urls: z.array(z.string()),
	}),
	icon: Eye,
	label: ({ id }) => (id ? `Looking at ${id}` : "Looking at a picture"),
	toModelOutput: ({ output }) =>
		imageOutput(
			`${output.id} (${output.urls.join(", ")}), from "${output.prompt}":`,
			...output.urls,
		),
	execute: async ({ id }, ctx) => {
		const image = ctx.elementImage(id);
		if (!image)
			throw new Error(
				`There is no element ${id} on the canvas. Read the script for the ids there are.`,
			);
		if (!image.ok)
			throw new Error(`${id} ${image.reason}, so there is nothing to look at.`);
		return { id, prompt: image.prompt, urls: image.urls };
	},
	snapshot: true,
});
