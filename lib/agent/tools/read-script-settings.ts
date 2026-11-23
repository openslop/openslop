import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { SlidersHorizontal } from "@/components/ui/icon";
import { ScriptSettingsSchema } from "@/lib/project/types";
import { defineTool } from "./define-tool";

export const readScriptSettings = defineTool({
	description: dedent`
	  Read the script settings: language, target length, format and template. The template
	  can't be changed, and write_script follows it.
	`,
	input: z.object({}),
	output: ScriptSettingsSchema,
	icon: SlidersHorizontal,
	label: "Reading the script settings",
	execute: async (_input, ctx) => ctx.readProject().scriptSettings,
	retention: "turn",
});
