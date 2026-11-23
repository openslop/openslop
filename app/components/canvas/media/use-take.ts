"use client";

import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useElementHistorySelector } from "@/lib/generation/generation-queue-provider";
import type { MediaItem } from "@/lib/project/media";
import { useMediaPanel } from "./media-panel-context";

/** The draft take that made `item`. */
export function useTake(item: MediaItem) {
	const { draftIds } = useMediaPanel();
	return useElementHistorySelector((history) =>
		draftIds
			.flatMap((id) => history.get(id))
			.find(({ result }) => getPrimaryUrl(result, item.kind) === item.url),
	);
}
