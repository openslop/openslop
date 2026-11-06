"use client";

import { useRef } from "react";
import { toSeconds } from "@/lib/render/frames";
import { snapTargets } from "@/lib/render/snap";
import { usePlayerControl } from "../player-control-context";
import type { HoverHeadHandle } from "./timeline-hover-head";
import type { TimelineRow } from "./timeline-rows";

export type TrimSnap = {
	/** The times a handle can stick to, apart from the dragged element's own edges. */
	targets: (exceptElementId: string) => number[];
	onSnap: (sec: number | null) => void;
};

/** A trim handle sticks to the other clips' edges and the playhead, and the guide marks where it's held. */
export function useTrimSnap(rows: TimelineRow[], fps: number) {
	const { player } = usePlayerControl();
	const guide = useRef<HoverHeadHandle>(null);
	const snap: TrimSnap = {
		targets: (exceptElementId) => [
			...(player ? [toSeconds(player.getCurrentFrame(), fps)] : []),
			...snapTargets(
				rows.flatMap((row) => row.clips),
				exceptElementId,
			),
		],
		onSnap: (sec) =>
			sec === null ? guide.current?.hide() : guide.current?.show(sec),
	};
	return { snap, guide };
}
