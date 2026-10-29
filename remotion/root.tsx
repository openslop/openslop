import React from "react";
import { Composition } from "remotion";
import { ActiveCaptionFont } from "./components/active-caption-font";
import { VideoComposition } from "./compositions/video-composition";
import { VideoSettingsSchema } from "@/lib/project/video-settings";
import { buildRenderLayout } from "@/lib/render/scene-builder";
import type { RenderLayout } from "@/lib/render/types";
import { COMPOSITION_ID } from "@/lib/render/types";

const defaultProps = buildRenderLayout([], VideoSettingsSchema.parse({}));

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
		defaultProps={defaultProps}
		calculateMetadata={({ props }) => ({
			durationInFrames: props.totalFrames,
			fps: props.fps,
			width: props.width,
			height: props.height,
		})}
	/>
);
