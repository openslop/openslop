"use client";

import type { ToolUIPart } from "ai";
import {
	Eye,
	Film,
	Hourglass,
	Mic,
	Pencil,
	Robot,
	SlidersHorizontal,
	Translate,
	User,
	type IconComponent,
} from "@/components/ui/icon";
import { SLOPPY_TOOLS } from "@/lib/agent/tools/registry";
import type { SloppyTools } from "@/lib/agent/types";

type ToolPresentation = { icon: IconComponent; label: string };

type ToolPart = ToolUIPart<SloppyTools>;

const OFFERED: ReadonlySet<string> = new Set(
	Object.keys(SLOPPY_TOOLS).map((name) => `tool-${name}`),
);

/** A stored transcript can hold a tool this build has renamed away, and it still has to render. */
const pastTool = (type: string): ToolPresentation => ({
	icon: Robot,
	label: type.replace(/^tool-/, "").replaceAll("_", " "),
});

export function toolPresentation(part: ToolPart): ToolPresentation {
	return OFFERED.has(part.type) ? offeredTool(part) : pastTool(part.type);
}

/** Exhaustive over the tools this build offers: a new one without a case is a type error. */
function offeredTool(part: ToolPart): ToolPresentation {
	switch (part.type) {
		case "tool-read_script":
			return { icon: Eye, label: "Reading the script" };
		case "tool-edit_script": {
			const count = part.input?.ops?.length ?? 0;
			return {
				icon: Pencil,
				label:
					count === 1
						? "Editing the script (1 change)"
						: `Editing the script (${count} changes)`,
			};
		}
		case "tool-write_script":
			return { icon: Film, label: "Writing a new script" };
		case "tool-adapt_script":
			return { icon: Film, label: "Putting your script on the canvas" };
		case "tool-set_video_settings":
			return { icon: Hourglass, label: "Adjusting the video settings" };
		case "tool-view_reference_images":
			return { icon: Eye, label: "Looking at the reference images" };
		case "tool-view_avatar": {
			const name = part.input?.name;
			return {
				icon: Eye,
				label: name ? `Looking at ${name}'s avatar` : "Looking at an avatar",
			};
		}
		case "tool-outline_story":
			return { icon: Pencil, label: "Outlining the story" };
		case "tool-measure_total_length":
			return { icon: Hourglass, label: "Measuring the video's length" };
		case "tool-measure_element_lengths":
			return {
				icon: Hourglass,
				label: "Measuring how long each visual is shown",
			};
		case "tool-set_language":
			return { icon: Translate, label: "Setting the language" };
		case "tool-set_metadata":
			return {
				icon: SlidersHorizontal,
				label: "Setting the project's settings",
			};
		case "tool-set_narrator":
			return { icon: Mic, label: "Adjusting the narrator's voice" };
		case "tool-set_character": {
			const name = part.input?.name;
			return {
				icon: User,
				label: name ? `Setting the character ${name}` : "Setting a character",
			};
		}
	}
}
