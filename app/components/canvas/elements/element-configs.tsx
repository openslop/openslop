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
	CONTENT_TYPES,
	type ContentElement,
	type ContentType,
	type ContentSpec,
} from "@/lib/canvas/types";
import { AnimateButton } from "./animate-button";
import { CharacterSwitcher } from "./character-switcher";
import { ElementCaptionsButton } from "./element-captions-button";
import { ElementVoiceButton } from "./element-voice-button";
import { fromKeys, keysOf } from "@/lib/utils";

type ElementControl = ComponentType<{
	element: ContentElement;
	className?: string;
}>;

/** How a content type looks on the canvas, and the controls its card adds to every card's own. */
type ElementPresentation = {
	label: string;
	Icon: IconComponent;
	/** Tint for the square type-icon container, keyed to the media-type color. */
	iconBgClass: string;
	/** Text color for the type pill's icon + label, keyed to the media-type color. */
	colorClass: string;
	placeholder: string;
	/** Beside the type pill. */
	lead?: ElementControl;
	/** Speaks on its asset_voice's model, so shows none of its own. */
	hidesModel?: boolean;
	/** Beside the history button. */
	tools?: ElementControl[];
	/** Beside the generate button. */
	actions?: ElementControl[];
};

type ElementConfig = ContentSpec & ElementPresentation & { type: ContentType };

const PRESENTATION: Record<ContentType, ElementPresentation> = {
	narration: {
		label: "Narration",
		hidesModel: true,
		Icon: Voice,
		iconBgClass: "bg-media-narration/15",
		colorClass: "text-media-narration",
		placeholder: "Write the narration...",
		tools: [ElementVoiceButton, ElementCaptionsButton],
	},
	character: {
		label: "Character",
		hidesModel: true,
		Icon: User,
		iconBgClass: "bg-media-character/15",
		colorClass: "text-media-character",
		placeholder: "What does this character say?",
		lead: CharacterSwitcher,
		tools: [ElementVoiceButton, ElementCaptionsButton],
	},
	image: {
		label: "Image",
		Icon: ImageIcon,
		iconBgClass: "bg-media-image/15",
		colorClass: "text-media-image",
		placeholder: "Describe the image...",
		actions: [AnimateButton],
	},
	video: {
		label: "Video",
		Icon: Video,
		iconBgClass: "bg-media-video/15",
		colorClass: "text-media-video",
		placeholder: "Describe the video...",
		tools: [ElementCaptionsButton],
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
		tools: [ElementCaptionsButton],
	},
};

export const ELEMENT_CONFIGS: Record<ContentType, ElementConfig> = fromKeys(
	keysOf(CONTENT_TYPES),
	(type) => ({ type, ...CONTENT_TYPES[type], ...PRESENTATION[type] }),
);

export const ELEMENT_LIST = Object.values(ELEMENT_CONFIGS);
