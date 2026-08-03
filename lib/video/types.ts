import type {
	CanvasElementType,
	ElementRole,
	LayerType,
} from "@/lib/canvas/types";
import type { TextTimestamp } from "@/lib/connectors/types";
import type { MotionEffect } from "./motionEffects";
import type { TransitionType } from "./transitions";

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
	captionTimestamps?: TextTimestamp[];
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

export const BASE_WIDTH = 1920;
export const BASE_HEIGHT = 1080;

export const DEFAULT_CONFIG: VideoConfig = {
	fps: 24,
	width: BASE_WIDTH,
	height: BASE_HEIGHT,
};
