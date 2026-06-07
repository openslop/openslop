"use client";

import type { PlayerRef } from "@remotion/player";
import { createContext, type ReactNode, useContext } from "react";
import type { VideoLayout } from "@/lib/video/types";
import { usePlayerValue } from "./usePlayerState";
import { findSegmentIndexAt, type SceneSegment } from "./useSceneSegments";

const ActiveSegmentIndexContext = createContext<number>(-1);

export function ActiveSegmentProvider({
	player,
	layout,
	segments,
	children,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
	segments: SceneSegment[];
	children: ReactNode;
}) {
	const activeIndex = usePlayerValue(
		player,
		["frameupdate"],
		(p) => findSegmentIndexAt(segments, p.getCurrentFrame() / layout.fps),
		-1,
	);
	return (
		<ActiveSegmentIndexContext.Provider value={activeIndex}>
			{children}
		</ActiveSegmentIndexContext.Provider>
	);
}

export function useActiveSegmentIndex(): number {
	return useContext(ActiveSegmentIndexContext);
}
