import { previousVisual } from "@/lib/canvas/scenes";
import { withReferences } from "@/lib/connectors/plugins";
import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import { dependency } from "@/lib/generation/dependency";
import { captureFrames } from "@/lib/connectors/video/captureFrames";
import {
	CONTINUITY_ATTR,
	CONTINUITY_FRAMES,
	type FrameKey,
	NO_FRAME,
	PREVIOUS_VISUAL,
	START_FRAME,
	START_FRAME_ATTR,
} from "../startFrame";

export type ParamsWithPreviousVisual = {
	prompt: string;
	frameImage?: string;
	referenceImages?: string[];
	[START_FRAME_ATTR]?: string;
	[CONTINUITY_ATTR]?: string;
};

/** No result means nothing came before the video. */
async function previousPictures(
	source: AssetResult | undefined,
	frames: readonly FrameKey[],
): Promise<string[]> {
	if (!source) return [];
	if (source.videoUrl) return captureFrames(source.videoUrl, frames);
	if (source.imageUrl) return [source.imageUrl];
	throw new Error("The previous visual generated no picture to hand on");
}

/** A start frame by URL is only an input; opening on or linking to the previous visual depends on it. */
export const previousVisualDependency = dependency(
	"previousVisual",
	"the previous visual",
	({ id, generationAttributes: attrs = {} }, { canvas }) =>
		attrs[START_FRAME_ATTR] === PREVIOUS_VISUAL ||
		attrs[CONTINUITY_ATTR] === "true"
			? previousVisual(canvas, id)
			: undefined,
);

/** Opening on the previous visual takes its end as the start frame; linking adds its beginning and middle as references. */
export function createPreviousVisualPlugin(): ConnectorPlugin<ParamsWithPreviousVisual> {
	return {
		name: "previous-visual",
		dependencies: [previousVisualDependency],
		async beforeGenerate(
			{
				[START_FRAME_ATTR]: frame = NO_FRAME,
				[CONTINUITY_ATTR]: continuity,
				...params
			},
			ctx,
		) {
			const source = previousVisualDependency.read(ctx);
			const [frameImage] =
				frame === PREVIOUS_VISUAL
					? await previousPictures(source, [START_FRAME])
					: URL.canParse(frame)
						? [frame]
						: [];
			const references =
				continuity === "true"
					? await previousPictures(source, CONTINUITY_FRAMES)
					: [];
			return withReferences(
				{ ...params, ...(frameImage && { frameImage }) },
				references,
			);
		},
	};
}
