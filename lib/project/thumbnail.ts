import type { ContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import type { GenerationQueue } from "@/lib/generation/queue";

/** The first picture the script generated: what the project looks like. */
export function pickThumbnailUrl(
	elements: ContentElement[],
	queue: Pick<GenerationQueue, "getElementSnapshot">,
): string | null {
	let video: string | null = null;
	for (const { id } of elements) {
		const result = queue.getElementSnapshot(id).result;
		const image = getPrimaryUrl(result, "image");
		if (image) return image;
		const candidate = getPrimaryUrl(result, "video");
		if (candidate && isVideoThumbnailUrl(candidate)) {
			video ??= candidate;
		}
	}
	return video;
}

/** Whether a thumbnail URL points at a video, so the card can render <video>. */
export function isVideoThumbnailUrl(url: string): boolean {
	const path = url.split(/[?#]/, 1)[0].toLowerCase();
	return /\.(mp4|webm|mov|m4v)$/.test(path);
}
