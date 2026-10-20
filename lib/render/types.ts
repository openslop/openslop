import type { ContentType, ElementRole, LayerType } from "@/lib/canvas/types";
import type { TextTimestamp } from "@/lib/connectors/types";
import type { CaptionStyle } from "../captions/caption-style";
import type { MotionEffect } from "./motion-effect-names";
import type { TransitionType } from "./transitions";

export type ResolvedElement = {
	id: string;
	type: ContentType;
	role: ElementRole;
	layer: LayerType;
	/** The scene that holds it, and its place in the document. */
	sceneId: string;
	sceneNumber: number;
	prompt: string;
	url: string;
	/** How long it holds the timeline once trimmed; a visual can outlast its media. */
	durationSec: number;
	mediaDurationSec: number;
	trimStartSec: number;
	loops: number;
	/** Whether a video restarts when it ends, instead of holding its last frame. */
	loop: boolean;
	volume: number;
	motion: MotionEffect;
	captionTimestamps?: TextTimestamp[];
};

export type Sequence = {
	element: ResolvedElement;
	start: number;
	duration: number;
};

export type RenderLayout = {
	series: Sequence[];
	sequences: Partial<Record<ContentType, Sequence[]>>;
	fps: number;
	width: number;
	height: number;
	totalDurationSec: number;
	totalFrames: number;
	transitionType: TransitionType;
	transitionDurationSec: number;
	captionStyle: CaptionStyle;
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
