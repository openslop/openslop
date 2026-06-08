"use client";

import type { PlayerRef } from "@remotion/player";
import { useEffect } from "react";
import { useSetActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { useAutoScroll } from "@/app/components/scene-selection/AutoScrollContext";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import { usePlayerPlaying } from "./usePlayerState";
import type { SceneSegment } from "./useSceneSegments";

export function useActiveSceneSync(
	player: PlayerRef | null,
	segments: SceneSegment[],
	activeIndex: number,
) {
	const setActiveSceneId = useSetActiveSceneId();
	const { enabled: autoScrollEnabled } = useAutoScroll();
	const playing = usePlayerPlaying(player);
	const activeId =
		activeIndex >= 0 ? (segments[activeIndex]?.sceneId ?? null) : null;

	useEffect(() => {
		setActiveSceneId(activeId);
	}, [activeId, setActiveSceneId]);

	useEffect(() => {
		if (autoScrollEnabled && playing && activeId) scrollToScene(activeId);
	}, [activeId, autoScrollEnabled, playing]);

	useEffect(() => () => setActiveSceneId(null), [setActiveSceneId]);
}
