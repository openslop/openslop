import type { AssetResult, ConnectorPlugin } from "@/lib/connectors/types";
import { forCanvasElement } from "@/lib/generation/graph";
import { captureLastFrame } from "@/lib/video/captureLastFrame";
import {
	parseStartFrame,
	START_FRAME_ATTR,
	type StartFrame,
} from "../startFrame";

export type ParamsWithStartFrame = {
	prompt: string;
	frameImages?: string[];
	[START_FRAME_ATTR]?: string;
};

/** The picture to open on: the URL itself, an image source's picture, or a clip source's last frame. */
async function frameUrl(
	frame: StartFrame,
	sources: Record<string, AssetResult> = {},
): Promise<string> {
	if (frame.kind === "url") return frame.url;
	const source = sources[frame.id];
	if (!source)
		throw new Error(
			`The start frame's source "${frame.id}" has not generated yet`,
		);
	if (source.videoUrl) return captureLastFrame(source.videoUrl);
	if (source.imageUrl) return source.imageUrl;
	throw new Error("The start frame's source generated no picture to open on");
}

/**
 * Opens the clip on a picture. A source on the canvas is a dependency, so the
 * clip waits for it, and regenerating it stales the clip; a plain URL is only
 * an input.
 */
export function createStartFramePlugin(): ConnectorPlugin<ParamsWithStartFrame> {
	return {
		name: "start-frame",
		dependencies: (element) => {
			const frame = parseStartFrame(
				element.generationAttributes?.[START_FRAME_ATTR],
			);
			return frame?.kind === "element"
				? [forCanvasElement(frame.id, "the start frame")]
				: [];
		},
		async beforeGenerate({ [START_FRAME_ATTR]: raw, ...params }, ctx) {
			const frame = parseStartFrame(raw);
			if (!frame) return params;
			return {
				...params,
				frameImages: [await frameUrl(frame, ctx.dependencies)],
			};
		},
	};
}
