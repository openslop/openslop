import type { CanvasElementType } from "@/lib/canvas/types";
import type { MotionEffect } from "./motionEffects";
import type { TransitionType } from "./transitions";

export type ElementRole = "foreground" | "background" | "overlay" | "effect";

export const ELEMENT_ROLES: Record<CanvasElementType, ElementRole> = {
	image: "foreground",
	clip: "foreground",
	narration: "overlay",
	character: "overlay",
	music: "background",
	sound: "effect",
};

export type LayerType = "audio" | "visual";

export const LAYER_TYPES: Record<CanvasElementType, LayerType> = {
	image: "visual",
	clip: "visual",
	narration: "audio",
	character: "audio",
	music: "audio",
	sound: "audio",
};

export type ResolvedElement = {
	id: string;
	type: CanvasElementType;
	role: ElementRole;
	layer: LayerType;
	url: string;
	durationSec: number;
	loops: number;
	volume: number;
	motion: MotionEffect;
};

export type Sequence = {
	element: ResolvedElement | null;
	start: number;
	duration: number;
};

export type VideoLayout = {
	series: Sequence[];
	sequences: Partial<Record<CanvasElementType, Sequence[]>>;
	fps: number;
	width: number;
	height: number;
	totalDurationSec: number;
	totalFrames: number;
	transitionType: TransitionType;
	transitionDurationSec: number;
};

export const COMPOSITION_ID = "VideoComposition";

export type VideoConfig = {
	fps: number;
	width: number;
	height: number;
};

export const DEFAULT_CONFIG: VideoConfig = {
	fps: 30,
	width: 1920,
	height: 1080,
};
