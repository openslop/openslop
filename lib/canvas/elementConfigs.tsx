import {
	Voice,
	Motion,
	Music,
	User,
	Image as ImageIcon,
	Video,
	Waveform,
	type LucideIcon,
} from "@/components/ui/icon";
import type { CanvasElementType, ResultKind } from "@/lib/canvas/types";
import type { ConnectorType } from "@/lib/connectors/types";
import { TTSEmotion, TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import { MOTION_EFFECTS } from "@/lib/video/motionEffects";

export type AttributeEdit =
	| { kind: "enum"; options: readonly string[] }
	| { kind: "text"; placeholder?: string; rows?: number };

export interface AttributeSpec {
	color: string;
	label: string;
	/** When set, the badge shows this icon in place of the text label. */
	icon?: LucideIcon;
	edit?: AttributeEdit;
}

export interface ElementConfig {
	type: CanvasElementType;
	connector: ConnectorType;
	outputKind: ResultKind;
	label: string;
	icon: React.ReactNode;
	/** Tint for the square type-icon container, keyed to the media-type color. */
	iconBgClass: string;
	/** Text color for the type pill's icon + label, keyed to the media-type color. */
	colorClass: string;
	placeholder: string;
	defaultAttributes?: Record<string, string>;
	visibleAttributes: Record<string, AttributeSpec>;
}

const LOOPS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;
const VOLUME_OPTIONS = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
] as const;
const EMOTION_OPTIONS = Object.values(TTSEmotion);
const CAPTIONS_OPTIONS = ["on", "off"] as const;
const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 4));

const volumeSpec = (color: string): AttributeSpec => ({
	color,
	label: "Volume",
	edit: { kind: "enum", options: VOLUME_OPTIONS },
});

const speedSpec = (color: string): AttributeSpec => ({
	color,
	label: "Speed",
	edit: { kind: "enum", options: TTS_SPEEDS },
});

const motionSpec = (color: string): AttributeSpec => ({
	color,
	label: "Motion",
	edit: { kind: "enum", options: MOTION_EFFECTS },
});

const durationSpec = (color: string): AttributeSpec => ({
	color,
	label: "Duration",
	edit: { kind: "enum", options: DURATION_OPTIONS },
});

const captionsSpec = (color: string): AttributeSpec => ({
	color,
	label: "Captions",
	edit: { kind: "enum", options: CAPTIONS_OPTIONS },
});

const videoPromptSpec = (color: string): AttributeSpec => ({
	color,
	label: "Video prompt",
	edit: {
		kind: "text",
		placeholder: "Describe the camera or subject motion…",
		rows: 3,
	},
});

export const ELEMENT_CONFIGS: Record<CanvasElementType, ElementConfig> = {
	narration: {
		type: "narration",
		connector: "tts",
		outputKind: "audio",
		label: "Narration",
		icon: <Voice size={16} strokeWidth={1.5} />,
		iconBgClass: "bg-media-narration/15",
		colorClass: "text-media-narration",
		placeholder: "Write the narration...",
		defaultAttributes: {
			emotion: "neutral",
			volume: "10",
			speed: "medium",
			captions: "on",
		},
		visibleAttributes: {
			emotion: {
				color: "bg-pink-500",
				label: "Emotion",
				edit: { kind: "enum", options: EMOTION_OPTIONS },
			},
			speed: speedSpec("bg-slate-500"),
			volume: volumeSpec("bg-slate-500"),
			captions: captionsSpec("bg-slate-500"),
		},
	},
	character: {
		type: "character",
		connector: "tts",
		outputKind: "audio",
		label: "Character",
		icon: <User size={16} strokeWidth={1.5} />,
		iconBgClass: "bg-media-character/15",
		colorClass: "text-media-character",
		placeholder: "What does this character say?",
		defaultAttributes: {
			emotion: "neutral",
			volume: "10",
			speed: "medium",
			captions: "on",
		},
		visibleAttributes: {
			emotion: {
				color: "bg-pink-500",
				label: "Emotion",
				edit: { kind: "enum", options: EMOTION_OPTIONS },
			},
			speed: speedSpec("bg-amber-600"),
			volume: volumeSpec("bg-amber-600"),
			captions: captionsSpec("bg-amber-600"),
		},
	},
	image: {
		type: "image",
		connector: "image",
		outputKind: "image",
		label: "Image",
		icon: <ImageIcon size={16} strokeWidth={1.5} />,
		iconBgClass: "bg-media-image/15",
		colorClass: "text-media-image",
		placeholder: "Describe the image...",
		defaultAttributes: {
			motion: "none",
		},
		visibleAttributes: {
			motion: motionSpec("bg-cyan-500"),
		},
	},
	animated_image: {
		type: "animated_image",
		connector: "animated_image",
		outputKind: "video",
		label: "Animated image",
		icon: <Motion size={16} strokeWidth={1.5} />,
		iconBgClass: "bg-media-animated/15",
		colorClass: "text-media-animated",
		placeholder: "Describe the still image...",
		defaultAttributes: {
			motion: "none",
			videoPrompt: "slow cinematic pan",
			duration: "5",
		},
		visibleAttributes: {
			videoPrompt: videoPromptSpec("bg-fuchsia-500"),
			duration: durationSpec("bg-fuchsia-500"),
			motion: motionSpec("bg-fuchsia-500"),
		},
	},
	clip: {
		type: "clip",
		connector: "video",
		outputKind: "video",
		label: "Clip",
		icon: <Video size={16} strokeWidth={1.5} />,
		iconBgClass: "bg-media-clip/15",
		colorClass: "text-media-clip",
		placeholder: "Describe the video clip...",

		defaultAttributes: {
			duration: "5",
			volume: "5",
			motion: "none",
		},
		visibleAttributes: {
			duration: durationSpec("bg-indigo-500"),
			volume: volumeSpec("bg-indigo-500"),
			motion: motionSpec("bg-indigo-500"),
		},
	},
	sound: {
		type: "sound",
		connector: "sfx",
		outputKind: "audio",
		label: "Sound",
		icon: <Waveform size={16} strokeWidth={1.5} />,
		iconBgClass: "bg-media-sound/15",
		colorClass: "text-media-sound",
		placeholder: "Describe the sound effect...",

		defaultAttributes: {
			loops: "1",
			volume: "2",
		},
		visibleAttributes: {
			loops: {
				color: "bg-teal-500",
				label: "Loops",
				edit: { kind: "enum", options: LOOPS_OPTIONS },
			},
			volume: volumeSpec("bg-emerald-500"),
		},
	},
	music: {
		type: "music",
		connector: "music",
		outputKind: "audio",
		label: "Music",
		icon: <Music size={16} strokeWidth={1.5} />,
		iconBgClass: "bg-media-music/15",
		colorClass: "text-media-music",
		placeholder: "Describe the music...",
		defaultAttributes: {
			loops: "1",
			volume: "2",
		},
		visibleAttributes: {
			loops: {
				color: "bg-violet-500",
				label: "Loops",
				edit: { kind: "enum", options: LOOPS_OPTIONS },
			},
			volume: volumeSpec("bg-violet-500"),
		},
	},
};

export const ELEMENT_LIST = Object.values(ELEMENT_CONFIGS);
