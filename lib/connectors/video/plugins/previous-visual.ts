import { previousVisual } from "@/lib/canvas/scenes";
import { isToggleOn } from "@/lib/canvas/types";
import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import { z } from "zod";
import type { Dependency, Read } from "@/lib/generation/declare";
import { captureFrames } from "@/lib/connectors/video/capture-frames";
import { type ClipRange, clipRange } from "@/lib/connectors/video/clip-range";
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

/** No result means nothing came before the video. Frames come from the part of a video that plays. */
async function previousPictures(
	source: AssetResult | undefined,
	frames: readonly FrameKey[],
	range: ClipRange | undefined,
): Promise<string[]> {
	if (!source) return [];
	if (source.videoUrl) return captureFrames(source.videoUrl, frames, range);
	if (source.imageUrl) return [source.imageUrl];
	throw new Error("The previous visual generated no picture to hand on");
}

async function openingPicture(
	frame: string | undefined,
	source: AssetResult | undefined,
	range: ClipRange | undefined,
): Promise<string | undefined> {
	const opening = frameSource(frame);
	if (opening.kind === "none") return undefined;
	if (opening.kind === "upload") return opening.url;
	const [picture] = await previousPictures(source, [START_FRAME], range);
	return picture;
}

const PREVIOUS_VISUAL_LABEL = "the previous visual";

const PREVIOUS_TRIM_LABEL = "the previous visual's trim";

const ClipRangeSchema = z.object({
	startSec: z.number(),
	endSec: z.number().optional(),
});

const isLinked = (attrs: Record<string, string>) =>
	frameSource(attrs[START_FRAME_ATTR]).kind === "previous" ||
	isToggleOn(attrs[CONTINUITY_ATTR]);

/** A start frame by URL is only an input; opening on or linking to the previous visual depends on it. */
const previousWhenLinked: Dependency = (
	{ id, generationAttributes: attrs = {} },
	{ canvas },
) => ({
	[PREVIOUS_VISUAL_LABEL]: isLinked(attrs)
		? previousVisual(canvas, id)
		: undefined,
});

/** Its frames come from the part of the previous video that plays, so trimming it stales the video. A whole video reads nothing. */
const previousTrimWhenLinked: Read = (
	{ id, generationAttributes: attrs = {} },
	{ canvas },
) => {
	const previous = isLinked(attrs) ? previousVisual(canvas, id) : undefined;
	const range = previous?.type === "video" ? clipRange(previous) : undefined;
	return { [PREVIOUS_TRIM_LABEL]: range && JSON.stringify(range) };
};

/** Opening on the previous visual takes its end as the start frame; linking carries on from its beginning and middle. */
export function createPreviousVisualPlugin(): ConnectorPlugin<ParamsWithPreviousVisual> {
	return {
		name: "previous-visual",
		dependencies: [previousWhenLinked],
		reads: [previousTrimWhenLinked],
		async beforeGenerate(
			{ [START_FRAME_ATTR]: frame, [CONTINUITY_ATTR]: continuity, ...params },
			ctx,
		) {
			const source = ctx.dependencies?.[PREVIOUS_VISUAL_LABEL];
			const trim = ctx.reads?.[PREVIOUS_TRIM_LABEL];
			const range = trim ? ClipRangeSchema.parse(JSON.parse(trim)) : undefined;
			const frameImage = await openingPicture(frame, source, range);
			const continuityFrames = isToggleOn(continuity)
				? await previousPictures(source, CONTINUITY_FRAMES, range)
				: [];
			return { ...params, ...(frameImage && { frameImage }), continuityFrames };
		},
	};
}
