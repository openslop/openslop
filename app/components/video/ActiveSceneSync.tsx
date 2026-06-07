"use client";

import type { PlayerRef } from "@remotion/player";
import { useEffect } from "react";
import type { VideoLayout } from "@/lib/video/types";
import { useSetActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { useAutoScroll } from "@/app/components/scene-selection/AutoScrollContext";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import {
	PLAYER_FRAME_EVENTS,
	usePlayerPlaying,
	usePlayerValue,
} from "./usePlayerState";
import { findSegmentIndexAt, type SceneSegment } from "./useSceneSegments";

export function ActiveSceneSync({
	player,
	layout,
	segments,
}: {
	player: PlayerRef | null;
	layout: VideoLayout;
	segments: SceneSegment[];
}) {
	const setActiveSceneId = useSetActiveSceneId();
	const { enabled: autoScrollEnabled } = useAutoScroll();
	const playing = usePlayerPlaying(player);
	const activeIndex = usePlayerValue(
		player,
		PLAYER_FRAME_EVENTS,
		(p) => findSegmentIndexAt(segments, p.getCurrentFrame() / layout.fps),
		-1,
	);
	const activeId =
		activeIndex >= 0 ? (segments[activeIndex]?.sceneId ?? null) : null;

	useEffect(() => {
		setActiveSceneId(activeId);
	}, [activeId, setActiveSceneId]);

	useEffect(() => {
		if (autoScrollEnabled && playing && activeId) scrollToScene(activeId);
	}, [activeId, autoScrollEnabled, playing]);

	useEffect(() => () => setActiveSceneId(null), [setActiveSceneId]);

	return null;
}
