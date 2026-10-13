import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Eye } from "@/components/ui/icon";
import compact from "lodash/compact";
import type { ElementState } from "../element-state";
import { defineTool, imageOutput } from "./define-tool";

const NO_PICTURE: Record<ElementState["state"], string> = {
	ungenerated: "has not been generated yet",
	queued: "is waiting to generate",
	generating: "is still generating",
	failed: "failed to generate",
	generated: "generated no picture",
	stale: "generated no picture",
	pinned: "holds no picture",
};

export const viewImage = defineTool({
	description: dedent`
	  Look at the pictures an element holds: what an image generated, a character's avatar
	  (their asset_avatar element) or the reference images the user uploaded (the
	  asset_references element). You receive the pictures themselves alongside the prompt behind them, so you
	  can say whether a result matches what was asked for. Take the id from read_script.
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
		const element = ctx.elementImage(id);
		if (!element)
			throw new Error(
				`There is no element ${id} on the canvas. Read the script for the ids there are.`,
			);
		const { pictures } = element;
		if (!pictures)
			throw new Error(
				`${id} is of type ${element.type}, which holds no picture to look at.`,
			);
		const why =
			pictures.kind === "generated"
				? compact([NO_PICTURE[pictures.state], pictures.detail]).join(": ")
				: "has no reference images uploaded";
		if (pictures.urls.length === 0)
			throw new Error(`${id} ${why}, so there is nothing to look at.`);
		return { id, prompt: element.prompt, urls: pictures.urls };
	},
	snapshot: true,
});
