import { dedent } from "@/lib/dedent";
import type { TemplatePrompt } from "@/lib/templates/prompts";

export function templatePrompt(
	template: TemplatePrompt,
	brief: string,
	language: string,
): string {
	return dedent`Pastiche this story format (with tone, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about the following topic: <user_input>${brief}</user_input>. Write the story in ${language}.

		Example story: ${template.exampleText}`;
}
