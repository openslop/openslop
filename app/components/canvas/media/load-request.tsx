"use client";

import { MagicEdit } from "@/components/ui/icon";
import { getPrimaryUrl } from "@/lib/connectors/asset-url";
import { useElementHistorySelector } from "@/lib/generation/generation-queue-provider";
import type { MediaItem } from "@/lib/project/media";
import { TileMenuItem, type TilePrimary } from "../elements/tile-actions";
import { useMediaPanel } from "./media-panel-context";

/** Loads the request that made `item` back into its draft, when a draft made it. */
export function useLoadRequest(item: MediaItem): TilePrimary | undefined {
	const { reuse, draftIds } = useMediaPanel();
	const take = useElementHistorySelector((history) =>
		draftIds
			.flatMap((id) => history.get(id))
			.find(({ result }) => getPrimaryUrl(result, item.kind) === item.url),
	);
	return (
		take && {
			label: `Load the request that made ${item.name}`,
			icon: MagicEdit,
			onSelect: () => reuse(take),
		}
	);
}

export const LoadRequestItem = ({ onSelect }: TilePrimary) => (
	<TileMenuItem icon={MagicEdit} onSelect={onSelect}>
		Load request
	</TileMenuItem>
);
