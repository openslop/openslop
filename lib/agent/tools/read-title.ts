import { z } from "zod";
import { TextBox } from "@/components/ui/icon";
import { defineTool } from "./define-tool";

export const readTitle = defineTool({
	description: "Read the project's title, empty until one is set.",
	input: z.object({}),
	output: z.string(),
	icon: TextBox,
	label: "Reading title",
	execute: async (_input, ctx) => ctx.readProject().title,
	retention: "turn",
});
