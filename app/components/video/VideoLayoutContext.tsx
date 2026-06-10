"use client";

import { useMemo, type ReactNode } from "react";
import type { Editor } from "slate";
import type { SceneElement } from "@/lib/canvas/types";
import { createRequiredContext } from "@/lib/components/createRequiredContext";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import type { AspectRatio } from "@/lib/video/aspectRatio";
import type { TransitionType } from "@/lib/video/transitions";
import type { VideoLayout } from "@/lib/video/types";
import { useAssetPrefetch } from "./useAssetPrefetch";
import { useVideoLayout } from "./useVideoLayout";

type VideoLayoutValue = {
	layout: VideoLayout | null;
	ready: boolean;
	playerKey: string;
	scenes: SceneElement[];
};

const [VideoLayoutContext, useLayout] =
	createRequiredContext<VideoLayoutValue>("VideoLayoutContext");
export { useLayout };

export function VideoLayoutProvider({
	editor,
	layoutKey,
	transitionType,
	aspectRatio,
	children,
}: {
	editor: Editor;
	layoutKey: string;
	transitionType: TransitionType;
	aspectRatio: AspectRatio;
	children: ReactNode;
}) {
	const { layout, playerKey, scenes } = useVideoLayout(
		editor,
		layoutKey,
		transitionType,
		aspectRatio,
	);
	const prefetched = useAssetPrefetch(layout);
	const busy = useQueueSelector((q) => q.isBusy());
	const ready = prefetched && !busy;
	const value = useMemo(
		() => ({ layout, ready, playerKey, scenes }),
		[layout, ready, playerKey, scenes],
	);
	return <VideoLayoutContext value={value}>{children}</VideoLayoutContext>;
}
