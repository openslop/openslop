import { dedent } from "@/lib/dedent";
import { z } from "zod";
import { Template } from "@/components/ui/icon";
import { getTemplateById } from "@/lib/templates/templates";
import { defineTool } from "./define-tool";

export const readTemplate = defineTool({
	description: dedent`
	  Read the project's template: its guide and an example story. Read it before writing a new
	  script from an idea when read_script_settings shows a template. A template can't be changed.
	`,
	input: z.object({}),
	output: z.string(),
	icon: Template,
	label: "Reading the template",
	execute: async (_input, ctx) => {
		const template = getTemplateById(ctx.readProject().scriptSettings.template);
		if (!template) return "This project has no template.";
		return `${template.name}: ${template.systemPrompt}\n\nExample story: ${template.exampleText}`;
	},
	retention: "turn",
});
