import {
	Voice,
	Motion,
	Music,
	User,
	Image as ImageIcon,
	Video,
	Waveform,
} from "@/components/ui/icon";
import {
	ELEMENT_TYPES,
	type CanvasElementType,
	type ElementTypeSpec,
} from "@/lib/canvas/types";

export interface ElementConfig extends ElementTypeSpec {
	type: CanvasElementType;
	label: string;
	icon: React.ReactNode;
	/** Tint for the square type-icon container, keyed to the media-type color. */
	iconBgClass: string;
	/** Text color for the type pill's icon + label, keyed to the media-type color. */
	colorClass: string;
	placeholder: string;
}

export const ELEMENT_CONFIGS: Record<CanvasElementType, ElementConfig> = {
	narration: {
		type: "narration",
		...ELEMENT_TYPES.narration,
		label: "Narration",
		icon: <Voice size={16} />,
		iconBgClass: "bg-media-narration/15",
		colorClass: "text-media-narration",
		placeholder: "Write the narration...",
	},
	character: {
		type: "character",
		...ELEMENT_TYPES.character,
		label: "Character",
		icon: <User size={16} />,
		iconBgClass: "bg-media-character/15",
		colorClass: "text-media-character",
		placeholder: "What does this character say?",
	},
	image: {
		type: "image",
		...ELEMENT_TYPES.image,
		label: "Image",
		icon: <ImageIcon size={16} />,
		iconBgClass: "bg-media-image/15",
		colorClass: "text-media-image",
		placeholder: "Describe the image...",
	},
	animated_image: {
		type: "animated_image",
		...ELEMENT_TYPES.animated_image,
		label: "Animated image",
		icon: <Motion size={16} />,
		iconBgClass: "bg-media-animated/15",
		colorClass: "text-media-animated",
		placeholder: "Describe the still image...",
	},
	clip: {
		type: "clip",
		...ELEMENT_TYPES.clip,
		label: "Clip",
		icon: <Video size={16} />,
		iconBgClass: "bg-media-clip/15",
		colorClass: "text-media-clip",
		placeholder: "Describe the video clip...",
	},
	sound: {
		type: "sound",
		...ELEMENT_TYPES.sound,
		label: "Sound",
		icon: <Waveform size={16} />,
		iconBgClass: "bg-media-sound/15",
		colorClass: "text-media-sound",
		placeholder: "Describe the sound effect...",
	},
	music: {
		type: "music",
		...ELEMENT_TYPES.music,
		label: "Music",
		icon: <Music size={16} />,
		iconBgClass: "bg-media-music/15",
		colorClass: "text-media-music",
		placeholder: "Describe the music...",
	},
};

export const ELEMENT_LIST = Object.values(ELEMENT_CONFIGS);
