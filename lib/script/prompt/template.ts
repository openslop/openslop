import dedent from "dedent";
import { getTemplate } from "@/lib/templates/templates";

export function templatePrompt(
	templateId: string,
	brief: string,
	language: string,
): string {
	return dedent`Pastiche this story format (with tone, pacing, imagery, plot techniques, story beats, structure, etc.) and reframe it to be about the following topic: <user_input>${brief}</user_input>. Write the story in ${language}.

		Example story: ${getTemplate(templateId).exampleText}`;
}
