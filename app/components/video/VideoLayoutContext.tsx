"use client";

import { useMemo, type ReactNode } from "react";
import type { Editor } from "slate";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import type { SceneElement } from "@/lib/canvas/types";
import type { Sequence, VideoLayout } from "@/lib/video/types";
import { useAssetPrefetch } from "./useAssetPrefetch";
import {
	buildSceneSegments,
	buildSequenceIndex,
	findSceneSequence,
	type SceneSegment,
	type SequenceIndex,
} from "./useSceneSegments";
import { useVideoLayout } from "./useVideoLayout";

type VideoLayoutValue = {
	layout: VideoLayout;
	ready: boolean;
	playerKey: string;
	segments: SceneSegment[];
	sequenceByElementId: SequenceIndex;
};

const [VideoLayoutContext, useLayout] =
	createRequiredContext<VideoLayoutValue>("VideoLayoutContext");
export { useLayout };

export function VideoLayoutProvider({
	editor,
	layoutKey,
	children,
}: {
	editor: Editor;
	layoutKey: string;
	children: ReactNode;
}) {
	const { layout, playerKey, scenes } = useVideoLayout(editor, layoutKey);
	const prefetched = useAssetPrefetch(layout);
	const busy = useQueueSelector((q) => q.isBusy());
	const ready = prefetched && !busy;
	const sequenceByElementId = useMemo(
		() => buildSequenceIndex(layout.series),
		[layout.series],
	);
	const segments = useMemo(
		() => buildSceneSegments(scenes, layout, sequenceByElementId),
		[scenes, layout, sequenceByElementId],
	);
	const value = useMemo(
		() => ({ layout, ready, playerKey, segments, sequenceByElementId }),
		[layout, ready, playerKey, segments, sequenceByElementId],
	);
	return <VideoLayoutContext value={value}>{children}</VideoLayoutContext>;
}

/** The rendered sequence a scene's foreground element occupies, if it has one. */
export function useSceneSequence(scene: SceneElement): Sequence | undefined {
	const { sequenceByElementId } = useLayout();
	return findSceneSequence(scene, sequenceByElementId);
}
