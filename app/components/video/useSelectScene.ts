"use client";

import { useCallback } from "react";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import { useSetActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { clamp } from "@/lib/utils";
import { toFrames } from "@/lib/video/frames";
import { usePlayerScrub } from "./usePlayerScrub";
import { useLayout } from "./VideoLayoutContext";

/**
 * Picking a scene: mark it active, bring it into view on the canvas, and move
 * the playhead to where it starts. A scene with nothing on the timeline yet has
 * no start, and is selected without seeking.
 */
export function useSelectScene() {
	const { layout } = useLayout();
	const setActiveSceneId = useSetActiveSceneId();
	const scrub = usePlayerScrub();

	return useCallback(
		(sceneId: string, startSec: number | null) => {
			setActiveSceneId(sceneId);
			scrollToScene(sceneId);
			if (startSec === null) return;
			scrub.seekTo(
				toFrames(clamp(startSec, 0, layout.totalDurationSec), layout.fps),
			);
		},
		[layout.fps, layout.totalDurationSec, scrub, setActiveSceneId],
	);
}
