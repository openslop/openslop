import {
	BookOpen,
	User,
	Image as ImageIcon,
	Film,
	Volume2,
	Music,
} from "lucide-react";
import type { CanvasElementType, ResultKind } from "../types";
import type { ConnectorType } from "@/lib/connectors/types";
import { TTSEmotion } from "@/lib/connectors/tts/enums";

export interface AttributeSpec {
	color: string;
	label: string;
	edit?: { options: readonly string[] };
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
const EMOTION_OPTIONS = Object.values(TTSEmotion);

export const ELEMENT_CONFIGS: Record<CanvasElementType, ElementConfig> = {
	narration: {
		type: "narration",
		connector: "tts",
		outputKind: "audio",
		label: "Narration",
		icon: <BookOpen size={16} className="text-white" />,
		bgColor: "bg-slate-600",
		placeholder: "Write the narration...",
		visibleAttributes: {
			emotion: {
				color: "bg-pink-500",
				label: "Emotion",
				edit: { options: EMOTION_OPTIONS },
			},
		},
	},
	character: {
		type: "character",
		connector: "tts",
		outputKind: "audio",
		label: "Character",
		icon: <User size={16} className="text-white" />,
		bgColor: "bg-amber-600",
		placeholder: "What does this character say?",
		visibleAttributes: {
			emotion: {
				color: "bg-pink-500",
				label: "Emotion",
				edit: { options: EMOTION_OPTIONS },
			},
		},
	},
	image: {
		type: "image",
		connector: "image",
		outputKind: "image",
		label: "Image",
		icon: <ImageIcon size={16} className="text-white" />,
		bgColor: "bg-cyan-600",
		placeholder: "Describe the image...",
		visibleAttributes: {},
	},
	clip: {
		type: "clip",
		connector: "video",
		outputKind: "video",
		label: "Clip",
		icon: <Film size={16} className="text-white" />,
		bgColor: "bg-indigo-600",
		placeholder: "Describe the video clip...",

		defaultAttributes: {
			duration: "5",
		},
		visibleAttributes: {
			duration: { color: "bg-indigo-500", label: "Duration" },
		},
	},
	sound: {
		type: "sound",
		connector: "sfx",
		outputKind: "audio",
		label: "Sound",
		icon: <Volume2 size={16} className="text-white" />,
		bgColor: "bg-emerald-600",
		placeholder: "Describe the sound effect...",

		defaultAttributes: {
			loops: "1",
		},
		visibleAttributes: {
			loops: {
				color: "bg-teal-500",
				label: "Loops",
				edit: { options: LOOPS_OPTIONS },
			},
		},
	},
	music: {
		type: "music",
		connector: "music",
		outputKind: "audio",
		label: "Music",
		icon: <Music size={16} className="text-white" />,
		bgColor: "bg-violet-600",
		placeholder: "Describe the music...",
		defaultAttributes: {
			loops: "1",
		},
		visibleAttributes: {
			loops: {
				color: "bg-violet-500",
				label: "Loops",
				edit: { options: LOOPS_OPTIONS },
			},
		},
	},
};

export const ELEMENT_LIST = Object.values(ELEMENT_CONFIGS);
