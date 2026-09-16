import { previousVisual } from "@/lib/canvas/scenes";
import type {
	AssetResult,
	ConnectorPlugin,
	PluginContext,
} from "@/lib/connectors/types";
import {
	derivedNodeId,
	sourceNode,
	type NodeSpec,
} from "@/lib/generation/graph";
import { captureFrames } from "@/lib/connectors/video/captureFrames";
import {
	CONTINUITY_ATTR,
	isLinked,
	parseStartFrame,
	splitPrevious,
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

/** What a settled visual hands on, in time order: a video's frames, or the image itself. */
async function picturesOf(source: AssetResult): Promise<string[]> {
	if (source.videoUrl) return captureFrames(source.videoUrl);
	if (source.imageUrl) return [source.imageUrl];
	throw new Error("The previous visual generated no picture to hand on");
}

/** The previous visual's pictures, or none for a video element with no visual before it. */
async function previousPictures({
	elementId = "",
	canvas = [],
	dependencies = {},
}: PluginContext): Promise<string[]> {
	const id = previousVisual(canvas, elementId)?.id;
	if (!id) return [];
	const source = dependencies[id];
	if (!source)
		throw new Error(`The previous visual "${id}" has not generated yet`);
	return picturesOf(source);
}

/**
 * What a video takes from the visual before it: opening on it, the last
 * picture is the start frame; linked, the rest join the reference images, so
 * the place and look carry over. Either makes the visual a dependency, so the
 * element waits for it, and regenerating or moving it stales the element; a
 * start frame by URL is only an input.
 */
export function createPreviousVisualPlugin(): ConnectorPlugin<ParamsWithPreviousVisual> {
	return {
		name: "previous-visual",
		dependencies: ({ id, generationAttributes: attrs = {} }) =>
			parseStartFrame(attrs[START_FRAME_ATTR])?.kind === "previous" ||
			isLinked(attrs[CONTINUITY_ATTR])
				? [forPreviousVisual(id)]
				: [],
		async beforeGenerate(
			{
				[START_FRAME_ATTR]: rawFrame,
				[CONTINUITY_ATTR]: continuity,
				...params
			},
			ctx,
		) {
			const frame = parseStartFrame(rawFrame);
			const opensOnPrevious = frame?.kind === "previous";
			const linked = isLinked(continuity);
			const pictures =
				opensOnPrevious || linked ? await previousPictures(ctx) : [];
			const { startFrame, rest } = splitPrevious(pictures, opensOnPrevious);
			const frameImages = frame?.kind === "url" ? [frame.url] : startFrame;
			const references = linked ? rest : [];
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
