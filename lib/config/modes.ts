import { scriptModePlugin } from "@/lib/connectors/llm/plugins/script-mode";
import { scriptLengthPlugin } from "@/lib/connectors/llm/plugins/script-length";
import { storyModePlugin } from "@/lib/connectors/llm/plugins/story-mode";
import { createTemplateModePlugin } from "@/lib/connectors/llm/plugins/template-mode";
import type { LLMPlugin } from "@/lib/connectors/types";
import type { Mode } from "@/lib/project/types";

type ModeSpec = {
	label: string;
	/** A pasted script is already the length the user wants, so nothing retargets it. */
	targetsLength: boolean;
	plugins: (templateId: string) => LLMPlugin[];
};

/** What a composer mode is: how it reads, what it asks the LLM for, and whether it takes a target length. */
export const MODE_SPECS: Record<Mode, ModeSpec> = {
	story: {
		label: "Describe a story",
		targetsLength: true,
		plugins: () => [storyModePlugin],
	},
	script: {
		label: "Paste in a script",
		targetsLength: false,
		plugins: () => [scriptModePlugin],
	},
	template: {
		label: "Use a template",
		targetsLength: true,
		plugins: (templateId) => [createTemplateModePlugin(templateId)],
	},
};

export function modePlugins(mode: Mode, templateId: string): LLMPlugin[] {
	const { plugins, targetsLength } = MODE_SPECS[mode];
	return [
		...plugins(templateId),
		...(targetsLength ? [scriptLengthPlugin] : []),
	];
}
