import React from "react";
import { Composition } from "remotion";
import { ActiveCaptionFont } from "./components/ActiveCaptionFont";
import { VideoComposition } from "./compositions/VideoComposition";
import type { RenderLayout } from "@/lib/render/types";
import { COMPOSITION_ID, DEFAULT_CONFIG } from "@/lib/render/types";
import { DEFAULT_CAPTION_STYLE } from "@/lib/captions/captionStyle";
import {
	DEFAULT_TRANSITION,
	TRANSITION_DURATION_SEC,
} from "@/lib/render/transitions";

const defaultProps: RenderLayout = {
	series: [],
	sequences: {},
	fps: DEFAULT_CONFIG.fps,
	width: DEFAULT_CONFIG.width,
	height: DEFAULT_CONFIG.height,
	totalDurationSec: 0,
	totalFrames: 1,
	transitionType: DEFAULT_TRANSITION,
	transitionDurationSec: TRANSITION_DURATION_SEC,
	captionStyle: DEFAULT_CAPTION_STYLE,
};

/**
 * Only the renderer registers the font here: the Player imports
 * `VideoComposition` directly and the editor has already registered the face.
 */
const RenderedVideo: React.FC<RenderLayout> = (props) => (
	<>
		<ActiveCaptionFont font={props.captionStyle.font} />
		<VideoComposition {...props} />
	</>
);

export const RemotionRoot: React.FC = () => (
	<Composition
		id={COMPOSITION_ID}
		component={RenderedVideo}
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
