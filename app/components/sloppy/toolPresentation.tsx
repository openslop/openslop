"use client";

import { Film, Pencil, Wand2, type IconComponent } from "@/components/ui/icon";

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

const PRESENTATION: Record<string, ToolPresentation> = {
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

export function toolPresentation(toolName: string): ToolPresentation {
	return (
		PRESENTATION[toolName] ?? {
			icon: Wand2,
			summarize: () => toolName.replaceAll("_", " "),
		}
	);
}
