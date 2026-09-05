import dedent from "dedent";
import { z } from "zod";
import { RotateCcw } from "@/components/ui/icon";
import { defineTool, noSuchElement } from "./defineTool";
import { ELEMENT_ID } from "./inputs";

export const restoreElementVersion = defineTool({
	description: dedent`
	  Put a past take of an element back on the canvas, by the version number
	  read_element_history gives it. The element's text and attributes go back to what made
	  that take, and the pieces it was built from (the still behind an animated_image) come
	  back with it. Tell the user what you restored.
	`,
	input: z.object({
		id: ELEMENT_ID,
		version: z
			.number()
			.int()
			.min(1)
			.describe(
				"The version number, exactly as read_element_history gives it.",
			),
	}),
	output: z.string(),
	icon: RotateCcw,
	label: ({ id, version }) =>
		id && version ? `Restoring v${version} of ${id}` : "Restoring a version",
	execute: async ({ id, version }, ctx) => {
		const read = await ctx.elementHistory(id);
		if (!read) throw noSuchElement(id);
		const { versions } = read;
		const target = versions.find((candidate) => candidate.index === version);
		if (!target)
			throw new Error(
				`${id} has ${versions.length} version${versions.length === 1 ? "" : "s"}, so there is no v${version}. Read its history for the numbers there are.`,
			);
		if (target.current)
			return `v${version} is already on the canvas for ${id}.`;
		await read.restore(version);
		return `Restored v${version} of ${id}: "${target.prompt}". Its text and attributes match that take again. The script has changed; read it again before editing further.`;
	},
	rewritesCanvas: true,
});
