/** The instruction the outline opens with, so the mock can recognise its own prompt. */
export const OUTLINE_INSTRUCTION = "Outline an engaging story";

export const outlinePrompt = (brief: string, language: string): string =>
	`${OUTLINE_INSTRUCTION} with a high-concept premise, characters, themes, conflict, twists, and a resolution. The story should be about the following: ${brief}. Write the outline in ${language}. Do not write anything else, just the outline.`;
