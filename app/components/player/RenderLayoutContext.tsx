"use client";

import { useMemo, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import type { SceneElement } from "@/lib/canvas/types";
import type { Sequence, RenderLayout } from "@/lib/render/types";
import {
	buildSceneSegments,
	buildSequenceIndex,
	findSceneSequence,
	type SceneSegment,
	type SequenceIndex,
} from "@/lib/render/sceneSegments";
import { useAssetPrefetch } from "./useAssetPrefetch";
import { useRenderLayout } from "./useRenderLayout";

type RenderLayoutValue = {
	layout: RenderLayout;
	ready: boolean;
	segments: SceneSegment[];
	scenes: SceneElement[];
	sequenceByElementId: SequenceIndex;
};

const [RenderLayoutContext, useLayout] =
	createRequiredContext<RenderLayoutValue>("RenderLayoutContext");
export { useLayout };

export function RenderLayoutProvider({ children }: { children: ReactNode }) {
	const editor = useSlateStatic();
	const { layout, scenes } = useRenderLayout(editor);
	const prefetched = useAssetPrefetch(layout);
	const busy = useQueueSelector((q) => q.isBusy());
	const ready = prefetched && !busy;
	const sequenceByElementId = useMemo(
		() => buildSequenceIndex(layout.series),
		[layout.series],
	);
	const segments = useMemo(() => buildSceneSegments(layout), [layout]);
	const value = useMemo(
		() => ({ layout, ready, segments, scenes, sequenceByElementId }),
		[layout, ready, segments, scenes, sequenceByElementId],
	);
	return <RenderLayoutContext value={value}>{children}</RenderLayoutContext>;
}

/** The rendered sequence a scene's foreground element occupies, if it has one. */
export function useSceneSequence(scene: SceneElement): Sequence | undefined {
	const { sequenceByElementId } = useLayout();
	return findSceneSequence(scene, sequenceByElementId);
}
