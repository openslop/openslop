"use client";

import { MagicEdit } from "@/components/ui/icon";
import type { MediaItem } from "@/lib/project/media";
import { TileMenuItem, type TilePrimary } from "../elements/tile-actions";
import { usePlayground } from "./playground-context";
import { useTake } from "./use-take";

/** Loads the request that made `item` back into the playground, when the playground made it. */
export function useLoadRequest(item: MediaItem): TilePrimary | undefined {
	const { take } = useTake(item);
	const { reuse } = usePlayground();
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
