"use client";

import { Eye, Film, Pencil, type IconComponent } from "@/components/ui/icon";
import type { AgentToolName } from "@/lib/agent/tools/specs";

type ToolPresentation = {
	icon: IconComponent;
	/**
	 * A call is summarized the moment the model emits it, so this names the
	 * proposed change rather than claiming it landed.
	 */
	summarize: (input: unknown) => string;
};

function opCount(input: unknown): number {
	if (typeof input !== "object" || input === null || !("ops" in input))
		return 0;
	const { ops } = input as { ops?: unknown };
	return Array.isArray(ops) ? ops.length : 0;
}

/** Keyed on the tool set, so a tool the model can call but nothing can name is a compile error. */
const PRESENTATION: Record<AgentToolName, ToolPresentation> = {
	read_script: {
		icon: Eye,
		summarize: () => "The script on the canvas",
	},
	edit_script: {
		icon: Pencil,
		summarize: (input) => {
			const count = opCount(input);
			return count === 1
				? "1 edit to the script"
				: `${count} edits to the script`;
		},
	},
	write_script: {
		icon: Film,
		summarize: () => "A new script",
	},
};

export function toolPresentation(toolName: AgentToolName): ToolPresentation {
	return PRESENTATION[toolName];
}
