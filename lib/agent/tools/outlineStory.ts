import dedent from "dedent";
import { spokenLanguage } from "@/lib/script/prompt/language";
import type { AgentToolContext } from "./context";
import type { ToolInput } from "./specs";

const outlinePrompt = (brief: string, language: string) =>
	dedent`Outline an engaging story with a high-concept premise, characters, themes, conflict, twists, and a resolution. The story should be about the following: ${brief}. Write the outline in ${language}. Do not write anything else, just the outline.`;

export async function outlineStory(
	{ brief }: ToolInput<"outline_story">,
	ctx: AgentToolContext,
): Promise<string> {
	const language = spokenLanguage(
		ctx.readMetadata(),
		"the same language as that input",
	);
	return ctx.generateText(outlinePrompt(brief, language), { maxTokens: 8192 });
}
