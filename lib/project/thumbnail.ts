import type { ContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import type { GenerationQueue } from "@/lib/generation/queue";

/** The first picture the script generated: what the project looks like. */
export function pickThumbnailUrl(
	elements: ContentElement[],
	queue: Pick<GenerationQueue, "getElementSnapshot">,
): string | null {
	for (const { id } of elements) {
		const url = getPrimaryUrl(queue.getElementSnapshot(id).result, "image");
		if (url) return url;
	}
	return null;
}
