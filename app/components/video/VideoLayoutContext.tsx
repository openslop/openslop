"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { Editor } from "slate";
import { generationQueue } from "@/lib/generation/queue";
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
  structureKey,
  children,
}: {
  getEditor: () => Editor | null;
  structureKey: string;
  children: ReactNode;
}) {
  const layout = useVideoLayout(getEditor, structureKey);
  const ready = useAssetPrefetch(layout);
  const playerKey = `${structureKey}-${generationQueue.getResultVersion()}`;
  const value = useMemo(
    () => ({ layout, ready, playerKey }),
    [layout, ready, playerKey],
  );
  return <VideoLayoutContext value={value}>{children}</VideoLayoutContext>;
}

export function useLayout() {
  return use(VideoLayoutContext);
}
