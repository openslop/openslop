"use client";

import type { ToolUIPart } from "ai";
import {
	Eye,
	Film,
	Hourglass,
	Mic,
	Pencil,
	SlidersHorizontal,
	Translate,
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
		case "tool-count_words":
			return { icon: Hourglass, label: "Counting the spoken words" };
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
