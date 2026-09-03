import {
	Image as ImageIcon,
	Music,
	TextBox,
	Video,
	Voice,
	Waveform,
	type IconComponent,
} from "@/components/ui/icon";
import type { ConnectorType } from "./types";

/**
 * What a person picks a model for. Coarser than a connector type on purpose:
 * nobody wants to choose a video model twice because an animated image and a
 * clip are generated differently, so a group sets every type it covers.
 */
export interface ModelGroup {
	key: string;
	label: string;
	Icon: IconComponent;
	/** The connector types this group sets, first one deciding what it shows. */
	types: ConnectorType[];
}

export const MODEL_GROUPS: ModelGroup[] = [
	{
		key: "images",
		label: "Images",
		Icon: ImageIcon,
		types: ["image"],
	},
	{
		key: "videos",
		label: "Videos",
		Icon: Video,
		types: ["animated_image", "video"],
	},
	{
		key: "voice",
		label: "Voice",
		Icon: Voice,
		types: ["tts"],
	},
	{
		key: "sound",
		label: "Sound",
		Icon: Waveform,
		types: ["sfx"],
	},
	{
		key: "music",
		label: "Music",
		Icon: Music,
		types: ["music"],
	},
	{
		key: "text",
		label: "Text",
		Icon: TextBox,
		types: ["llm"],
	},
];

/** The group a connector type belongs to. Every type is in exactly one. */
export function groupFor(type: ConnectorType): ModelGroup {
	const group = MODEL_GROUPS.find((entry) => entry.types.includes(type));
	if (!group) throw new Error(`No model group covers "${type}"`);
	return group;
}
