"use client";

import type { ToolUIPart } from "ai";
import {
	Eye,
	Film,
	Mic,
	Pencil,
	SlidersHorizontal,
	User,
	type IconComponent,
} from "@/components/ui/icon";
import type { SloppyTools } from "@/lib/agent/types";

type ToolPresentation = { icon: IconComponent; label: string };

export function toolPresentation(
	part: ToolUIPart<SloppyTools>,
): ToolPresentation {
	switch (part.type) {
		case "tool-read_script":
			return { icon: Eye, label: "Read the script" };
		case "tool-edit_script": {
			const count = part.input?.ops?.length ?? 0;
			return {
				icon: Pencil,
				label:
					count === 1
						? "Edited the script (1 change)"
						: `Edited the script (${count} changes)`,
			};
		}
		case "tool-write_script":
			return { icon: Film, label: "Wrote a new script" };
		case "tool-set_metadata":
			return { icon: SlidersHorizontal, label: "Set the project's settings" };
		case "tool-set_narrator":
			return { icon: Mic, label: "Set the narrator's voice" };
		case "tool-set_character": {
			const name = part.input?.name;
			return {
				icon: User,
				label: name ? `Set the character ${name}` : "Set a character",
			};
		}
	}
}
