import {
	type CanvasElement,
	type ElementOf,
	type OutputType,
	outputKindOf,
} from "@/lib/canvas/types";
import { assetUrlField } from "@/lib/connectors/asset-url";
import type { AssetResult } from "@/lib/connectors/types";
import type { GenerationNode } from "@/lib/generation/graph";
import type { GenerationQueue } from "@/lib/generation/queue";
import type { UploadKind } from "./upload-files";

async function mediaDurationSec(url: string): Promise<number> {
	const { ALL_FORMATS, Input, UrlSource } = await import("mediabunny");
	const input = new Input({
		source: new UrlSource(url),
		formats: ALL_FORMATS,
	});
	try {
		return (
			(await input.getDurationFromMetadata()) ?? (await input.computeDuration())
		);
	} finally {
		input.dispose();
	}
}

const READ_DURATION: Record<UploadKind, (url: string) => Promise<number>> = {
	image: async () => 0,
	video: mediaDurationSec,
	audio: mediaDurationSec,
};

/** Browser only. The result an element shows for media the user supplied. */
export async function uploadedResult(
	kind: UploadKind,
	url: string,
): Promise<AssetResult> {
	return {
		[assetUrlField(kind)]: url,
		durationSec: await READ_DURATION[kind](url),
		uploaded: true,
	};
}

/** The elements that take supplied media, each of the kind it would generate. */
export const UPLOADABLE_TYPES = [
	"image",
	"video",
	"music",
	"asset_avatar",
] as const satisfies readonly OutputType[];

type UploadableElement = ElementOf<(typeof UPLOADABLE_TYPES)[number]>;

export const isUploadable = (
	element: CanvasElement,
): element is UploadableElement =>
	(UPLOADABLE_TYPES as readonly string[]).includes(element.type);

export const uploadKindOf = (element: UploadableElement): UploadKind =>
	outputKindOf(element.type);

/** Pinned, so Generate All never overwrites what the user chose. */
export async function commitUploaded(
	queue: GenerationQueue,
	node: GenerationNode,
	kind: UploadKind,
	url: string,
): Promise<void> {
	queue.commitResult(node, await uploadedResult(kind, url), { pinned: true });
}
