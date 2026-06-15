import type { ElementSnapshot } from "@/lib/generation/queue";
import type { CanvasElementType } from "@/lib/canvas/types";

export type GenerationState = {
	status: ElementSnapshot["status"];
	seconds: number;
};

export type PlaceholderProps = GenerationState & {
	error: string | null;
	onDiscard: () => void;
};

export const BORDER_COLORS: Record<CanvasElementType, string> = {
	character: "border-media-character/30",
	image: "border-border",
	animated_image: "border-border",
	clip: "border-border",
	narration: "border-border",
	music: "border-media-music/30",
	sound: "border-media-sound/30",
};

export const WAVE_COLORS: Record<CanvasElementType, string> = {
	character: "rgb(251, 191, 36)",
	narration: "rgb(128, 128, 128)",
	music: "rgb(167, 139, 250)",
	sound: "rgb(52, 211, 153)",
	image: "rgb(34, 211, 238)",
	animated_image: "rgb(232, 121, 249)",
	clip: "rgb(129, 140, 248)",
};
