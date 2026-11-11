"use client";

import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useElementHistorySelector } from "@/lib/generation/generation-queue-provider";
import type { MediaItem } from "@/lib/project/media";
import { useMediaPanel } from "./media-panel-context";

/** The draft take that made `item`, and whether every draft's takes are read so its absence means an upload. */
export function useTake(item: MediaItem) {
	const { draftIds } = useMediaPanel();
	const take = useElementHistorySelector((history) =>
		draftIds
			.flatMap((id) => history.get(id))
			.find(({ result }) => getPrimaryUrl(result, item.kind) === item.url),
	);
	const traced = useElementHistorySelector((history) =>
		draftIds.every((id) => history.status(id) === "ready"),
	);
	return { take, traced };
}
