import type { ComponentType } from "react";
import {
	Voice,
	Music,
	User,
	Image as ImageIcon,
	Video,
	Waveform,
	type IconComponent,
} from "@/components/ui/icon";
import {
	ELEMENT_TYPES,
	type CanvasContentElement,
	type CanvasElementType,
	type ElementTypeSpec,
} from "@/lib/canvas/types";
import { AnimateButton } from "./AnimateButton";
import { CharacterSwitcher } from "./CharactersPicker";
import { ElementUploadButton } from "./ElementUploadButton";
import { ElementVoiceButton } from "./ElementVoiceButton";
import { ShownCharacters } from "./ShownCharacters";

type ElementControl = ComponentType<{
	element: CanvasContentElement;
	className?: string;
}>;

/** How an element type looks on the canvas, and the controls its card adds to every card's own. */
interface ElementConfig extends ElementTypeSpec {
	type: CanvasElementType;
	label: string;
	Icon: IconComponent;
	/** Tint for the square type-icon container, keyed to the media-type color. */
	iconBgClass: string;
	/** Text color for the type pill's icon + label, keyed to the media-type color. */
	colorClass: string;
	placeholder: string;
	/** Beside the type pill. */
	lead?: ElementControl;
	/** Beside the history button. */
	tools?: ElementControl[];
	/** Beside the generate button. */
	actions?: ElementControl[];
}

type ElementPresentation = Omit<ElementConfig, keyof ElementTypeSpec | "type">;

const PRESENTATION: Record<CanvasElementType, ElementPresentation> = {
	narration: {
		label: "Narration",
		Icon: Voice,
		iconBgClass: "bg-media-narration/15",
		colorClass: "text-media-narration",
		placeholder: "Write the narration...",
		tools: [ElementVoiceButton],
	},
	character: {
		label: "Character",
		Icon: User,
		iconBgClass: "bg-media-character/15",
		colorClass: "text-media-character",
		placeholder: "What does this character say?",
		lead: CharacterSwitcher,
		tools: [ElementVoiceButton],
	},
	image: {
		label: "Image",
		Icon: ImageIcon,
		iconBgClass: "bg-media-image/15",
		colorClass: "text-media-image",
		placeholder: "Describe the image...",
		lead: ShownCharacters,
		actions: [ElementUploadButton, AnimateButton],
	},
	video: {
		label: "Video",
		Icon: Video,
		iconBgClass: "bg-media-video/15",
		colorClass: "text-media-video",
		placeholder: "Describe the video...",
		lead: ShownCharacters,
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
