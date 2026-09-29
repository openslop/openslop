import { previousVisual } from "@/lib/canvas/scenes";
import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import { dependency } from "@/lib/generation/dependency";
import {
	derivedNodeId,
	sourceNode,
	type NodeSpec,
} from "@/lib/generation/graph";
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

const LABEL = "the previous visual";

/**
 * The visual before an element in document order. Resolved at build time, so
 * reordering the script changes what it names and stales the dependent. With
 * nothing before it, an empty leaf stands in and the dependent reads no result.
 */
const forPreviousVisual =
	(id: string): NodeSpec =>
	({ canvas }) => {
		const element = previousVisual(canvas, id);
		return element
			? { element, label: LABEL }
			: sourceNode(derivedNodeId("first", id), {}, LABEL);
	};

/** No result means the empty leaf: nothing came before the video. */
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
	({ id, generationAttributes: attrs = {} }) =>
		attrs[START_FRAME_ATTR] === PREVIOUS_VISUAL ||
		attrs[CONTINUITY_ATTR] === "true"
			? forPreviousVisual(id)
			: null,
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
			return {
				...params,
				...(frameImage && { frameImage }),
				...(references.length > 0 && {
					referenceImages: [...(params.referenceImages ?? []), ...references],
				}),
			};
		},
	};
}
