import dedent from "dedent";
import type { Template } from "@/lib/templates/templates";

export function templatePrompt(
	template: Template,
	brief: string,
	language: string,
): string {
	return dedent`Pastiche this story format (with tone, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about the following topic: <user_input>${brief}</user_input>. Write the story in ${language}.

		Example story: ${template.exampleText}`;
}
