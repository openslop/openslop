import { previousVisual } from "@/lib/canvas/scenes";
import { type CanvasElement, isToggleOn } from "@/lib/canvas/types";
import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import { getTrimEnd, parseNumber } from "@/lib/canvas/element-attributes";
import type { Dependency, Read } from "@/lib/generation/declare";
import { captureFrames } from "@/lib/connectors/video/capture-frames";
import {
	CONTINUITY_ATTR,
	CONTINUITY_FRAMES,
	type FrameKey,
	frameSource,
	START_FRAME,
	START_FRAME_ATTR,
} from "../start-frame";

export type ParamsWithPreviousVisual = {
	prompt: string;
	frameImage?: string;
	continuityFrames?: string[];
	[START_FRAME_ATTR]?: string;
	[CONTINUITY_ATTR]?: string;
};

/** No result means nothing came before the video. */
async function previousPictures(
	source: AssetResult | undefined,
	frames: readonly FrameKey[],
	endSec: number | undefined,
): Promise<string[]> {
	if (!source) return [];
	if (source.videoUrl) return captureFrames(source.videoUrl, frames, endSec);
	if (source.imageUrl) return [source.imageUrl];
	throw new Error("The previous visual generated no picture to hand on");
}

async function openingPicture(
	frame: string | undefined,
	source: AssetResult | undefined,
	endSec: number | undefined,
): Promise<string | undefined> {
	const opening = frameSource(frame);
	if (opening.kind === "none") return undefined;
	if (opening.kind === "upload") return opening.url;
	const [picture] = await previousPictures(source, [START_FRAME], endSec);
	return picture;
}

const PREVIOUS_VISUAL_LABEL = "the previous visual";

const PREVIOUS_LAST_FRAME_LABEL = "the last frame of the previous visual";

const linkedPrevious = (
	{ id, generationAttributes: attrs = {} }: CanvasElement,
	canvas: CanvasElement[],
) =>
	frameSource(attrs[START_FRAME_ATTR]).kind === "previous" ||
	isToggleOn(attrs[CONTINUITY_ATTR])
		? previousVisual(canvas, id)
		: undefined;

/** A start frame by URL is only an input; opening on or linking to the previous visual depends on it. */
const previousWhenLinked: Dependency = (element, { canvas }) => ({
	[PREVIOUS_VISUAL_LABEL]: linkedPrevious(element, canvas),
});

/** Frames come from where the previous video is cut, so moving its end stales this one. */
const previousEndWhenLinked: Read = (element, { canvas }) => {
	const previous = linkedPrevious(element, canvas);
	return {
		[PREVIOUS_LAST_FRAME_LABEL]: previous && getTrimEnd(previous)?.toString(),
	};
};

/** Opening on the previous visual takes its end as the start frame; linking carries on from its beginning and middle. */
export function createPreviousVisualPlugin(): ConnectorPlugin<ParamsWithPreviousVisual> {
	return {
		name: "previous-visual",
		dependencies: [previousWhenLinked],
		reads: [previousEndWhenLinked],
		async beforeGenerate(
			{ [START_FRAME_ATTR]: frame, [CONTINUITY_ATTR]: continuity, ...params },
			ctx,
		) {
			const source = ctx.dependencies?.[PREVIOUS_VISUAL_LABEL];
			const endSec = parseNumber(ctx.reads?.[PREVIOUS_LAST_FRAME_LABEL]);
			const frameImage = await openingPicture(frame, source, endSec);
			const continuityFrames = isToggleOn(continuity)
				? await previousPictures(source, CONTINUITY_FRAMES, endSec)
				: [];
			return { ...params, ...(frameImage && { frameImage }), continuityFrames };
		},
	};
}
