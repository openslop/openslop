"use client";

import { useMemo, useRef } from "react";
import { toSeconds } from "@/lib/render/frames";
import { laidOut } from "@/lib/render/clip-trim";
import { usePlayerControl } from "../player-control-context";
import type { HoverHeadHandle } from "./timeline-hover-head";
import type { TimelineRow } from "./timeline-rows";

export type TrimSnap = {
	/** The times a handle can stick to, apart from the dragged element's own edges. */
	targets: (exceptElementId: string) => number[];
	onSnap: (sec: number | null) => void;
};

type SnapEdge = { elementId: string; sec: number };

/** Every drawn clip edge: where it starts, where its media stops, and where its span ends. */
export function snapEdges(rows: TimelineRow[]): SnapEdge[] {
	return rows.flatMap((row) =>
		row.clips.flatMap((clip) =>
			[
				clip.start,
				clip.start + laidOut(clip).trimDurationSec,
				clip.start + clip.duration,
			].map((sec) => ({ elementId: clip.element.id, sec })),
		),
	);
}

/** A trim handle sticks to the other clips' edges and the playhead, and the guide marks where it's held. */
export function useTrimSnap(rows: TimelineRow[], fps: number) {
	const { player } = usePlayerControl();
	const guide = useRef<HoverHeadHandle>(null);
	const snap = useMemo<TrimSnap>(() => {
		const edges = snapEdges(rows);
		return {
			targets: (exceptElementId) => [
				...(player ? [toSeconds(player.getCurrentFrame(), fps)] : []),
				...edges
					.filter((edge) => edge.elementId !== exceptElementId)
					.map((edge) => edge.sec),
			],
			onSnap: (sec) =>
				sec === null ? guide.current?.hide() : guide.current?.show(sec),
		};
	}, [rows, player, fps]);
	return { snap, guide };
}
