import {
	Voice,
	Motion,
	Music,
	User,
	Image as ImageIcon,
	Video,
	Waveform,
	type IconComponent,
} from "@/components/ui/icon";
import {
	ELEMENT_TYPES,
	type CanvasElementType,
	type ElementTypeSpec,
} from "@/lib/canvas/types";

export interface ElementConfig extends ElementTypeSpec {
	type: CanvasElementType;
	label: string;
	Icon: IconComponent;
	/** Tint for the square type-icon container, keyed to the media-type color. */
	iconBgClass: string;
	/** Text color for the type pill's icon + label, keyed to the media-type color. */
	colorClass: string;
	placeholder: string;
}

type ElementPresentation = Omit<ElementConfig, keyof ElementTypeSpec | "type">;

const PRESENTATION: Record<CanvasElementType, ElementPresentation> = {
	narration: {
		label: "Narration",
		Icon: Voice,
		iconBgClass: "bg-media-narration/15",
		colorClass: "text-media-narration",
		placeholder: "Write the narration...",
	},
	character: {
		label: "Character",
		Icon: User,
		iconBgClass: "bg-media-character/15",
		colorClass: "text-media-character",
		placeholder: "What does this character say?",
	},
	image: {
		label: "Image",
		Icon: ImageIcon,
		iconBgClass: "bg-media-image/15",
		colorClass: "text-media-image",
		placeholder: "Describe the image...",
	},
	animated_image: {
		label: "Animated image",
		Icon: Motion,
		iconBgClass: "bg-media-animated/15",
		colorClass: "text-media-animated",
		placeholder: "Describe the still image...",
	},
	clip: {
		label: "Clip",
		Icon: Video,
		iconBgClass: "bg-media-clip/15",
		colorClass: "text-media-clip",
		placeholder: "Describe the video clip...",
	},
	sound: {
		label: "Sound",
		Icon: Waveform,
		iconBgClass: "bg-media-sound/15",
		colorClass: "text-media-sound",
		placeholder: "Describe the sound effect...",
	},
	music: {
		label: "Music",
		Icon: Music,
		iconBgClass: "bg-media-music/15",
		colorClass: "text-media-music",
		placeholder: "Describe the music...",
	},
};

export const ELEMENT_CONFIGS = Object.fromEntries(
	(Object.keys(ELEMENT_TYPES) as CanvasElementType[]).map((type) => [
		type,
		{ type, ...ELEMENT_TYPES[type], ...PRESENTATION[type] },
	]),
) as Record<CanvasElementType, ElementConfig>;

export const ELEMENT_LIST = Object.values(ELEMENT_CONFIGS);
