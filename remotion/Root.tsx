import React from "react";
import { Composition } from "remotion";
import { ActiveCaptionFont } from "./components/ActiveCaptionFont";
import { VideoComposition } from "./compositions/VideoComposition";
import { CaptionStyleProvider } from "./components/Captions";
import type { RenderInputProps } from "@/lib/render/types";
import { COMPOSITION_ID, DEFAULT_CONFIG } from "@/lib/render/types";
import { DEFAULT_CAPTION_STYLE } from "@/lib/captions/captionStyle";
import {
	DEFAULT_TRANSITION,
	transitionOverlapSec,
} from "@/lib/render/transitions";

const defaultProps: RenderInputProps = {
	series: [],
	sequences: {},
	fps: DEFAULT_CONFIG.fps,
	width: DEFAULT_CONFIG.width,
	height: DEFAULT_CONFIG.height,
	totalDurationSec: 0,
	totalFrames: 1,
	transitionType: DEFAULT_TRANSITION,
	transitionDurationSec: transitionOverlapSec(DEFAULT_TRANSITION),
	captionStyle: DEFAULT_CAPTION_STYLE,
};

/**
 * Only the renderer registers the font here: the Player imports
 * `VideoComposition` directly and the editor has already registered the face.
 */
const RenderedVideo: React.FC<RenderInputProps> = ({
	captionStyle,
	...layout
}) => (
	<CaptionStyleProvider value={captionStyle}>
		<ActiveCaptionFont font={captionStyle.font} />
		<VideoComposition {...layout} />
	</CaptionStyleProvider>
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
