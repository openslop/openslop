import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { SlidersHorizontal } from "@/components/ui/icon";
import { ScriptSettingsSchema } from "@/lib/project/types";
import { getTemplateById } from "@/lib/templates/templates";
import { defineTool } from "./define-tool";

export const readScriptSettings = defineTool({
	description: dedent`
	  Read the script settings: language, target length, format and template. A template comes
	  with its guide and an example story, and can't be changed.
	`,
	input: z.object({}),
	output: ScriptSettingsSchema.extend({
		templateGuide: z.string().optional(),
	}),
	icon: SlidersHorizontal,
	label: "Reading the script settings",
	execute: async (_input, ctx) => {
		const settings = ctx.readProject().scriptSettings;
		const template = getTemplateById(settings.template);
		return {
			...settings,
			templateGuide:
				template &&
				`${template.name}: ${template.systemPrompt}\n\nExample story: ${template.exampleText}`,
		};
	},
	retention: "turn",
});
