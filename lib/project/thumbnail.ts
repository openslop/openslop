import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { isCharacterAvatarId } from "./characterAvatar";

export function pickThumbnailUrl(
	entries: Iterable<[string, ElementSnapshot]>,
): string | null {
	for (const [id, snap] of entries) {
		// A character portrait is not what the project looks like.
		if (isCharacterAvatarId(id)) continue;
		const url = getPrimaryUrl(snap.result, "image");
		if (url) return url;
	}
	return null;
}
