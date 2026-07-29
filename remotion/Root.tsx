import React from "react";
import { Composition } from "remotion";
import { VideoComposition } from "./compositions/VideoComposition";
import type { VideoLayout } from "@/lib/video/types";
import { COMPOSITION_ID, DEFAULT_CONFIG } from "@/lib/video/types";
import {
	DEFAULT_TRANSITION,
	TRANSITION_DURATION_SEC,
} from "@/lib/video/transitions";

const defaultProps: VideoLayout = {
	series: [],
	sequences: {},
	fps: DEFAULT_CONFIG.fps,
	width: DEFAULT_CONFIG.width,
	height: DEFAULT_CONFIG.height,
	totalDurationSec: 0,
	totalFrames: 1,
	transitionType: DEFAULT_TRANSITION,
	transitionDurationSec: TRANSITION_DURATION_SEC,
};

export const RemotionRoot: React.FC = () => (
	<Composition
		id={COMPOSITION_ID}
		component={VideoComposition}
		durationInFrames={1}
		fps={DEFAULT_CONFIG.fps}
		width={DEFAULT_CONFIG.width}
		height={DEFAULT_CONFIG.height}
		defaultProps={defaultProps}
		calculateMetadata={({ props }) => ({
			durationInFrames: props.totalFrames,
			fps: props.fps,
			width: props.width,
			height: props.height,
		})}
	/>
);
