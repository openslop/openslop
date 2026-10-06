import { assetId } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";

/** A character's avatar is whatever their asset last generated. */
export function useCharacterAvatar(name = "") {
	const id = assetId("asset_character", name);
	return {
		url: useQueueSelector((q) =>
			getPrimaryUrl(q.getElementSnapshot(id).result, "image"),
		),
		status: useQueueSelector((q) => q.getElementSnapshot(id).status),
	};
}
