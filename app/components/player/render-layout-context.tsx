"use client";

import { useMemo, type ReactNode } from "react";
import { useSlateStatic } from "slate-react";
import { createRequiredContext } from "@/lib/components/create-required-context";
import { useQueueSelector } from "@/lib/generation/generation-queue-provider";
import type { Scene } from "@/lib/canvas/types";
import type { RenderLayout } from "@/lib/render/types";
import {
	buildSceneSegments,
	type SceneSegment,
} from "@/lib/render/scene-segments";
import { useAssetPrefetch } from "./use-asset-prefetch";
import { useRenderLayout } from "./use-render-layout";

type RenderLayoutValue = {
	layout: RenderLayout;
	ready: boolean;
	segments: SceneSegment[];
	scenes: Scene[];
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
	const segments = useMemo(() => buildSceneSegments(layout), [layout]);
	const value = useMemo(
		() => ({ layout, ready, segments, scenes }),
		[layout, ready, segments, scenes],
	);
	return <RenderLayoutContext value={value}>{children}</RenderLayoutContext>;
}

export function useSceneSegment(scene: Scene): SceneSegment | undefined {
	const { segments } = useLayout();
	return segments.find(({ sceneId }) => sceneId === scene.id);
}
