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
	parseStartFrame,
	START_FRAME_ATTR,
	type StartFrame,
} from "../startFrame";

export type ParamsWithStartFrame = {
	prompt: string;
	frameImages?: string[];
	[START_FRAME_ATTR]?: string;
};

const LABEL = "the start frame";

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

/** What a settled visual hands on: a video's first, middle and last frames, or the image itself. */
async function picturesOf(source: AssetResult): Promise<string[]> {
	if (source.videoUrl) return captureFrames(source.videoUrl);
	if (source.imageUrl) return [source.imageUrl];
	throw new Error("The start frame's source generated no picture to open on");
}

/** The pictures to open on, or none for a video element with no visual before it. */
async function frameUrls(
	frame: StartFrame | undefined,
	{ elementId = "", canvas = [], dependencies = {} }: PluginContext,
): Promise<string[]> {
	if (!frame) return [];
	if (frame.kind === "url") return [frame.url];
	const id = previousVisual(canvas, elementId)?.id;
	if (!id) return [];
	const source = dependencies[id];
	if (!source)
		throw new Error(`The start frame's source "${id}" has not generated yet`);
	return picturesOf(source);
}

/**
 * Opens the video element on a picture. The visual before it is a dependency,
 * so the element waits for it, and regenerating it stales the element; a plain
 * URL is only an input.
 */
export function createStartFramePlugin(): ConnectorPlugin<ParamsWithStartFrame> {
	return {
		name: "start-frame",
		dependencies: (element) => {
			const frame = parseStartFrame(
				element.generationAttributes?.[START_FRAME_ATTR],
			);
			return frame?.kind === "previous" ? [forPreviousVisual(element.id)] : [];
		},
		async beforeGenerate({ [START_FRAME_ATTR]: raw, ...params }, ctx) {
			const urls = await frameUrls(parseStartFrame(raw), ctx);
			return urls.length > 0 ? { ...params, frameImages: urls } : params;
		},
	};
}
