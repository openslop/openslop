import type { ElementSnapshot } from "@/lib/generation/queue";
import { isDerivedNodeId } from "@/lib/generation/graph";

export function pickThumbnailUrl(
	entries: Iterable<[string, ElementSnapshot]>,
): string | null {
	for (const [id, snap] of entries) {
		if (isDerivedNodeId(id)) continue;
		if (
			snap.connectorType !== "image" &&
			snap.connectorType !== "animated_image"
		)
			continue;
		const url = snap.result?.imageUrl;
		if (url) return url;
	}
	return null;
}
