import { previousVisual } from "@/lib/canvas/scenes";
import type { ConnectorPlugin, PluginContext } from "@/lib/connectors/types";
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
	frameImages?: string[];
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

async function previousPictures(
	{ elementId = "", canvas = [], dependencies = {} }: PluginContext,
	frames: readonly FrameKey[],
): Promise<string[]> {
	const id = previousVisual(canvas, elementId)?.id;
	if (!id) return [];
	const source = dependencies[id];
	if (!source)
		throw new Error(`The previous visual "${id}" has not generated yet`);
	if (source.videoUrl) return captureFrames(source.videoUrl, frames);
	if (source.imageUrl) return [source.imageUrl];
	throw new Error("The previous visual generated no picture to hand on");
}

/**
 * What a video takes from the visual before it: opening on it, its end is the
 * start frame; linked, its beginning and middle join the reference images,
 * so the place and look carry over. Either makes the visual a dependency, so the
 * element waits for it, and regenerating or moving it stales the element; a
 * start frame by URL is only an input.
 */
export function createPreviousVisualPlugin(): ConnectorPlugin<ParamsWithPreviousVisual> {
	return {
		name: "previous-visual",
		dependencies: ({ id, generationAttributes: attrs = {} }) =>
			attrs[START_FRAME_ATTR] === PREVIOUS_VISUAL ||
			attrs[CONTINUITY_ATTR] === "true"
				? [forPreviousVisual(id)]
				: [],
		async beforeGenerate(
			{
				[START_FRAME_ATTR]: frame = NO_FRAME,
				[CONTINUITY_ATTR]: continuity,
				...params
			},
			ctx,
		) {
			const frameImages =
				frame === PREVIOUS_VISUAL
					? await previousPictures(ctx, [START_FRAME])
					: URL.canParse(frame)
						? [frame]
						: [];
			const references =
				continuity === "true"
					? await previousPictures(ctx, CONTINUITY_FRAMES)
					: [];
			return {
				...params,
				...(frameImages.length > 0 && { frameImages }),
				...(references.length > 0 && {
					referenceImages: [...(params.referenceImages ?? []), ...references],
				}),
			};
		},
	};
}
