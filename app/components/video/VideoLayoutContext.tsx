"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { SceneElement } from "@/lib/canvas/types";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import type { VideoLayout } from "@/lib/video/types";
import { useCanvasEditor } from "../canvas/CanvasEditorContext";
import { useAssetPrefetch } from "./useAssetPrefetch";
import { useVideoLayout } from "./useVideoLayout";

type VideoLayoutValue = {
	layout: VideoLayout | null;
	ready: boolean;
	playerKey: string;
	scenes: SceneElement[];
};

const VideoLayoutContext = createContext<VideoLayoutValue>({
	layout: null,
	ready: false,
	playerKey: "",
	scenes: [],
});

export function VideoLayoutProvider({ children }: { children: ReactNode }) {
	const { editor, layoutKey } = useCanvasEditor();
	const { layout, playerKey, scenes } = useVideoLayout(editor, layoutKey);
	const prefetched = useAssetPrefetch(layout);
	const busy = useQueueSelector((q) => q.isBusy());
	const ready = prefetched && !busy;
	const value = useMemo(
		() => ({ layout, ready, playerKey, scenes }),
		[layout, ready, playerKey, scenes],
	);
	return <VideoLayoutContext value={value}>{children}</VideoLayoutContext>;
}

export function useLayout() {
	return use(VideoLayoutContext);
}
