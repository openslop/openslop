import dedent from "dedent";
import { z } from "zod";
import { Settings } from "@/components/ui/icon";
import { renderAgentContext } from "../context";
import { defineTool } from "./defineTool";

export const readSettings = defineTool({
	description: dedent`
	  Read the project's settings: title, art style, language, target length, aspect ratio,
	  template, narrator voice, reference images, characters, and whether the canvas has a
	  script. They are not given to you any other way. Read them before your first change in
	  a turn, and again if the user says they changed something; what your own set_* calls
	  changed, you already know.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Settings,
	label: "Reading the settings",
	execute: async (_input, ctx) => renderAgentContext(ctx.readSettings()),
	snapshot: true,
});
