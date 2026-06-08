import {
	BookOpen,
	User,
	Image as ImageIcon,
	Film,
	Sparkles,
	Volume2,
	Music,
} from "lucide-react";
import type { CanvasElementType, ResultKind } from "@/lib/canvas/types";
import type { ConnectorType } from "@/lib/connectors/types";
import { ELEMENT_METADATA } from "@/lib/canvas/elementMetadata";
import { TTSEmotion, TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import { MOTION_EFFECTS } from "@/lib/video/motionEffects";

export type AttributeEdit =
	| { kind: "enum"; options: readonly string[] }
	| { kind: "text"; placeholder?: string; rows?: number };

export interface AttributeSpec {
	color: string;
	label: string;
	edit?: AttributeEdit;
}

export interface ElementConfig {
	type: CanvasElementType;
	connector: ConnectorType;
	outputKind: ResultKind;
	label: string;
	icon: React.ReactNode;
	bgColor: string;
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

const emotionSpec: AttributeSpec = {
	color: "bg-pink-500",
	label: "Emotion",
	edit: { kind: "enum", options: EMOTION_OPTIONS },
};

export const ELEMENT_CONFIGS: Record<CanvasElementType, ElementConfig> = {
	narration: {
		type: "narration",
		...ELEMENT_METADATA.narration,
		label: "Narration",
		icon: <BookOpen size={16} className="text-white" />,
		bgColor: "bg-slate-600",
		placeholder: "Write the narration...",
		visibleAttributes: {
			emotion: emotionSpec,
			speed: speedSpec("bg-slate-500"),
			volume: volumeSpec("bg-slate-500"),
			captions: captionsSpec("bg-slate-500"),
		},
	},
	character: {
		type: "character",
		...ELEMENT_METADATA.character,
		label: "Character",
		icon: <User size={16} className="text-white" />,
		bgColor: "bg-amber-600",
		placeholder: "What does this character say?",
		visibleAttributes: {
			emotion: emotionSpec,
			speed: speedSpec("bg-amber-600"),
			volume: volumeSpec("bg-amber-600"),
			captions: captionsSpec("bg-amber-600"),
		},
	},
	image: {
		type: "image",
		...ELEMENT_METADATA.image,
		label: "Image",
		icon: <ImageIcon size={16} className="text-white" />,
		bgColor: "bg-cyan-600",
		placeholder: "Describe the image...",
		visibleAttributes: {
			motion: motionSpec("bg-cyan-500"),
		},
	},
	animated_image: {
		type: "animated_image",
		...ELEMENT_METADATA.animated_image,
		label: "Animated image",
		icon: <Sparkles size={16} className="text-white" />,
		bgColor: "bg-fuchsia-600",
		placeholder: "Describe the still image...",
		visibleAttributes: {
			videoPrompt: videoPromptSpec("bg-fuchsia-500"),
			motion: motionSpec("bg-fuchsia-500"),
		},
	},
	clip: {
		type: "clip",
		...ELEMENT_METADATA.clip,
		label: "Clip",
		icon: <Film size={16} className="text-white" />,
		bgColor: "bg-indigo-600",
		placeholder: "Describe the video clip...",
		visibleAttributes: {
			duration: { color: "bg-indigo-500", label: "Duration" },
			volume: volumeSpec("bg-indigo-500"),
			motion: motionSpec("bg-indigo-500"),
		},
	},
	sound: {
		type: "sound",
		...ELEMENT_METADATA.sound,
		label: "Sound",
		icon: <Volume2 size={16} className="text-white" />,
		bgColor: "bg-emerald-600",
		placeholder: "Describe the sound effect...",
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
		...ELEMENT_METADATA.music,
		label: "Music",
		icon: <Music size={16} className="text-white" />,
		bgColor: "bg-violet-600",
		placeholder: "Describe the music...",
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
