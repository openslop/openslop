"use client";

import { useEffect } from "react";
import { useSetActiveSceneId } from "@/app/components/scene-selection/active-scene-context";
import { useAutoScroll } from "@/app/components/scene-selection/auto-scroll-context";
import { scrollToScene } from "@/app/components/canvas/utils/scroll-to-scene";
import { usePlayerPlaying } from "./use-player-state";
import { useActiveSegmentIndex } from "./use-active-segment-index";
import { useLayout } from "./render-layout-context";

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
	const activeId = segments[activeIndex]?.sceneId ?? null;

	useEffect(() => {
		setActiveSceneId(activeId);
	}, [activeId, setActiveSceneId]);

	useEffect(() => {
		if (autoScrollEnabled && playing && activeId) scrollToScene(activeId);
	}, [activeId, autoScrollEnabled, playing]);

	useEffect(() => () => setActiveSceneId(null), [setActiveSceneId]);

	return null;
}
