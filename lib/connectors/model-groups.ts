import {
	Captions,
	Image as ImageIcon,
	Music,
	TextBox,
	Video,
	Voice,
	Waveform,
	type IconComponent,
} from "@/components/ui/icon";
import type { ConnectorModels } from "./models";
import type { ConnectorType, ModelRef } from "./types";

/** What a person picks a model for. */
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
		types: ["video"],
	},
	{
		key: "voice",
		label: "Text to Speech",
		Icon: Voice,
		types: ["voice", "tts"],
	},
	{
		key: "stt",
		label: "Speech to Text",
		Icon: Captions,
		types: ["stt"],
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

export const groupModels = (
	types: ConnectorType[],
	model: ModelRef,
): ConnectorModels => Object.fromEntries(types.map((type) => [type, model]));
