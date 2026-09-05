import dedent from "dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import type { GenerationStatus } from "@/lib/generation/snapshots";
import { defineTool, imageOutput, noSuchElement } from "./defineTool";
import { ELEMENT_ID } from "./inputs";

const NOT_READY: Record<GenerationStatus, string> = {
	idle: "has not been generated yet",
	queued: "is waiting to generate",
	generating: "is still generating",
};

export const viewImage = defineTool({
	description: dedent`
	  Look at the picture an element generated: an image element's result, or the still
	  frame an animated_image animates. You receive the picture itself alongside the prompt
	  that made it, so you can say whether the result matches what was asked for. Take the
	  id from read_script.
	  What you see is gone next turn, so act on it in this one.
	`,
	input: z.object({ id: ELEMENT_ID }),
	output: z.object({ id: z.string(), prompt: z.string(), url: z.string() }),
	icon: Eye,
	label: ({ id }) => (id ? `Looking at ${id}` : "Looking at a generated image"),
	toModelOutput: ({ output }) =>
		imageOutput(`${output.id}, generated from "${output.prompt}":`, output.url),
	execute: async ({ id }, ctx) => {
		const element = ctx.elementImage(id);
		if (!element) throw noSuchElement(id);
		const { picture } = element;
		if (!picture)
			throw new Error(
				`${id} is a ${element.type}, which generates no picture to look at.`,
			);
		if (!picture.url)
			throw new Error(
				`${id} ${NOT_READY[picture.status]}, so there is nothing to look at.`,
			);
		return { id, prompt: element.prompt, url: picture.url };
	},
	snapshot: true,
});
