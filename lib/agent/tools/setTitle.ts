import dedent from "dedent";
import { z } from "zod";
import { SlidersHorizontal } from "@/components/ui/icon";
import { defineTool } from "./defineTool";

export const setTitle = defineTool({
	description: dedent`
	  Set the project's title: 1 to 4 words, in the language the script is written in.
	`,
	input: z.object({ title: z.string().min(1) }),
	output: z.string(),
	icon: SlidersHorizontal,
	label: "Naming the project",
	execute: async ({ title }, ctx) => {
		ctx.setAsset("asset_title", undefined, { text: title });
		return `Set the title to ${title}.`;
	},
});
