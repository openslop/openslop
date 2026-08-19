import { getTemplate } from "@/lib/templates/templates";
import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function applyTemplate(
	{ template_id }: ToolInput<"apply_template">,
	ctx: AgentToolContext,
): Promise<string> {
	if (ctx.readScript().trim())
		throw new Error(
			"A template resets the project, so it cannot be applied over a script that is already on the canvas. Ask the user whether to discard what is there first.",
		);

	ctx.applyTemplate(template_id);
	return `Adopted the ${getTemplate(template_id).name} template, with its art style, characters and narrator. Write a script to see it.`;
}
