import type { ElementSnapshot } from "@/lib/generation/queue";
import { CHARACTER_AVATAR_ID_PREFIX } from "./ensureCharacterAvatars";

export function pickThumbnailUrl(
	entries: Iterable<[string, ElementSnapshot]>,
): string | null {
	for (const [id, snap] of entries) {
		if (id.startsWith(CHARACTER_AVATAR_ID_PREFIX)) continue;
		if (snap.connectorType !== "image") continue;
		const url = snap.result?.url;
		if (url) return url;
	}
	return null;
}
