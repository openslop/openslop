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
export interface ConnectorGroup {
	key: string;
	label: string;
	/** What picking a model here changes, in the user's terms. */
	description: string;
	Icon: IconComponent;
	/** The connector types this group sets, first one deciding what it shows. */
	types: ConnectorType[];
}

export const CONNECTOR_GROUPS: ConnectorGroup[] = [
	{
		key: "images",
		label: "Images",
		description: "Stills on image elements",
		Icon: ImageIcon,
		types: ["image"],
	},
	{
		key: "videos",
		label: "Videos",
		description: "Animated images and clips",
		Icon: Video,
		types: ["animated_image", "video"],
	},
	{
		key: "voice",
		label: "Voice",
		description: "Narration and character speech",
		Icon: Voice,
		types: ["tts"],
	},
	{
		key: "sound",
		label: "Sound",
		description: "Sound effects",
		Icon: Waveform,
		types: ["sfx"],
	},
	{
		key: "music",
		label: "Music",
		description: "Background music",
		Icon: Music,
		types: ["music"],
	},
	{
		key: "text",
		label: "Text",
		description: "Scripting, editing and chat",
		Icon: TextBox,
		types: ["llm"],
	},
];

/** The group a connector type belongs to. Every type is in exactly one. */
export function groupFor(type: ConnectorType): ConnectorGroup {
	const group = CONNECTOR_GROUPS.find((entry) => entry.types.includes(type));
	if (!group) throw new Error(`No connector group covers "${type}"`);
	return group;
}
