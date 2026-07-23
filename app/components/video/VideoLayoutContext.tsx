"use client";

import { useMemo, type ReactNode } from "react";
import type { Editor } from "slate";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import type { VideoLayout } from "@/lib/video/types";
import { useAssetPrefetch } from "./useAssetPrefetch";
import { buildSceneSegments, type SceneSegment } from "./useSceneSegments";
import { useVideoLayout } from "./useVideoLayout";

type VideoLayoutValue = {
	layout: VideoLayout;
	ready: boolean;
	playerKey: string;
	segments: SceneSegment[];
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
	const segments = useMemo(
		() => buildSceneSegments(scenes, layout),
		[scenes, layout],
	);
	const value = useMemo(
		() => ({ layout, ready, playerKey, segments }),
		[layout, ready, playerKey, segments],
	);
	return <VideoLayoutContext value={value}>{children}</VideoLayoutContext>;
}
