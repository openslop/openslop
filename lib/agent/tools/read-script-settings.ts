import { z } from "zod";
import { SlidersHorizontal } from "@/components/ui/icon";
import { ScriptSettingsSchema } from "@/lib/project/types";
import { defineTool } from "./define-tool";

export const readScriptSettings = defineTool({
	description:
		"Read the script settings: language, target length, format and template, if any.",
	input: z.object({}),
	output: ScriptSettingsSchema,
	icon: SlidersHorizontal,
	label: "Reading script settings",
	execute: async (_input, ctx) => ctx.readProject().scriptSettings,
	retention: "turn",
});
