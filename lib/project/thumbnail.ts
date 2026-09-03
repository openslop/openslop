import type { AssetConnectorType } from "@/lib/connectors/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { isCharacterAvatarId } from "./characterAvatar";

const PICTURED_BY: ReadonlySet<AssetConnectorType | null> = new Set([
	"image",
	"animated_image",
]);

export function pickThumbnailUrl(
	entries: Iterable<[string, ElementSnapshot]>,
): string | null {
	for (const [id, snap] of entries) {
		// A character portrait is not what the project looks like.
		if (isCharacterAvatarId(id)) continue;
		if (!PICTURED_BY.has(snap.connectorType)) continue;
		const url = getPrimaryUrl(snap.result, "image");
		if (url) return url;
	}
	return null;
}
