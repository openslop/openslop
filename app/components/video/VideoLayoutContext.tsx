"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { Editor } from "slate";
import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import type { VideoLayout } from "@/lib/video/types";
import { useAssetPrefetch } from "./useAssetPrefetch";
import { useVideoLayout } from "./useVideoLayout";

type VideoLayoutValue = {
	layout: VideoLayout | null;
	ready: boolean;
	playerKey: string;
};

const VideoLayoutContext = createContext<VideoLayoutValue>({
	layout: null,
	ready: false,
	playerKey: "",
});

export function VideoLayoutProvider({
	getEditor,
	layoutKey,
	children,
}: {
	getEditor: () => Editor | null;
	layoutKey: string;
	children: ReactNode;
}) {
	const { layout, playerKey } = useVideoLayout(getEditor, layoutKey);
	const prefetched = useAssetPrefetch(layout);
	const busy = useQueueSelector((q) => q.isBusy());
	const ready = prefetched && !busy;
	const value = useMemo(
		() => ({ layout, ready, playerKey }),
		[layout, ready, playerKey],
	);
	return <VideoLayoutContext value={value}>{children}</VideoLayoutContext>;
}

export function useLayout() {
	return use(VideoLayoutContext);
}
