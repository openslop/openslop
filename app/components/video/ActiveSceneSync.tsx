"use client";

import { useEffect } from "react";
import { useSetActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { useAutoScroll } from "@/app/components/scene-selection/AutoScrollContext";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import { usePlayerPlaying } from "./usePlayerState";
import { useActiveSegmentIndex } from "./useActiveSegmentIndex";
import { useLayout } from "./VideoLayoutContext";

/**
 * Renders nothing. It owns the frame subscription that tracks the playing
 * scene, so crossing a scene boundary re-renders this leaf instead of the
 * Remotion player it sits beside.
 */
export function ActiveSceneSync() {
	const { segments } = useLayout();
	const setActiveSceneId = useSetActiveSceneId();
	const { enabled: autoScrollEnabled } = useAutoScroll();
	const playing = usePlayerPlaying();
	const activeIndex = useActiveSegmentIndex();
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
