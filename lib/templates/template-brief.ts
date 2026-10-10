import type { Template } from "./templates";

/**
 * What the user asked for: the prefix the pill shows, finished by what they typed.
 * The composer decides whether a template applies; this decides how it reads.
 */
export function templateBrief(
	template: Template | undefined,
	input: string,
): string {
	return template ? `${template.promptPrefix} ${input.trim()}` : input;
}
