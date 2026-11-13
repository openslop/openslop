import type { ContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import type { GenerationQueue } from "@/lib/generation/queue";

/** The first image the script generated, else its first playable video. */
export function pickThumbnailUrl(
	elements: ContentElement[],
	queue: Pick<GenerationQueue, "getElementSnapshot">,
): string | null {
	const results = elements.map(({ id }) => queue.getElementSnapshot(id).result);
	const image = results
		.map((result) => getPrimaryUrl(result, "image"))
		.find(Boolean);
	const video = results
		.map((result) => getPrimaryUrl(result, "video"))
		.find((url) => url && isVideoThumbnailUrl(url));
	return image ?? video ?? null;
}

/** Whether a thumbnail URL points at a video, so the card can render <video>. */
export function isVideoThumbnailUrl(url: string): boolean {
	const path = url.split(/[?#]/, 1)[0].toLowerCase();
	return /\.(mp4|webm|mov|m4v)$/.test(path);
}
