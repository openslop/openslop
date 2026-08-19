import { languageLabel } from "@/lib/project/language";
import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

export async function setLanguage(
	{ language }: ToolInput<"set_language">,
	ctx: AgentToolContext,
): Promise<string> {
	ctx.setMetadata({ language });
	return `Set the language to ${languageLabel(language)}. It applies to the next script written; what is on the canvas is unchanged.`;
}
