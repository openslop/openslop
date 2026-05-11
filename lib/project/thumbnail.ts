import type { ElementSnapshot } from "@/lib/generation/queue";

export function pickThumbnailUrl(
	entries: Iterable<ElementSnapshot>,
): string | null {
	for (const snap of entries) {
		if (snap.result && snap.connectorType === "image") {
			return snap.result.url;
		}
	}
	return null;
}
